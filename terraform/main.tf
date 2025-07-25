# SNS Configuration
module "dicom_processing_sns" {
  source     = "./modules/sns"
  topic_name = "dicom-health-imaging-status-change-topic"
  subscriptions = [
    {
      protocol = "email"
      endpoint = "madmaxcloudonline@gmail.com"
    }
  ]
}

# EventBridge Rule
module "dicom_processing_eventbridge_rule" {
  source           = "./modules/eventbridge"
  rule_name        = "dicom-health-imaging-state-change-rule"
  rule_description = "It captures HealthImaging job state changes for DICOM processing"
  event_pattern = jsonencode({
    source = [
      "aws.medical-imaging"
    ]
    detail-type = [
      "Image Set Created"
    ]
  })
  target_id  = "Image Set Created"
  target_arn = module.dicom_processing_sns.topic_arn
}

# DynamoDB Table
module "dicom_processing_dynamodb" {
  source = "./modules/dynamodb"
  name   = "dicom-records"
  attributes = [
    {
      name = "RecordId"
      type = "S"
    },
    {
      name = "filename"
      type = "S"
    }
  ]
  billing_mode          = "PROVISIONED"
  hash_key              = "RecordId"
  range_key             = "filename"
  read_capacity         = 20
  write_capacity        = 20
  ttl_attribute_name    = "TimeToExist"
  ttl_attribute_enabled = true
}

# SQS
module "dicom_processing_sqs" {
  source                        = "./modules/sqs"
  queue_name                    = "dicom-processing-queue"
  delay_seconds                 = 0
  maxReceiveCount               = 3
  dlq_message_retention_seconds = 86400
  dlq_name                      = "dicom-processing-dlq"
  max_message_size              = 262144
  message_retention_seconds     = 345600
  visibility_timeout_seconds    = 180
  receive_wait_time_seconds     = 20
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "s3.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = "arn:aws:sqs:${var.region}:*:dicom-processing-queue"
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = module.source_bucket.arn
          }
        }
      }
    ]
  })
}

module "cognito" {
  source                     = "./modules/cognito"
  name                       = "dicom_processing_users"
  username_attributes        = ["email"]
  auto_verified_attributes   = ["email"]
  password_minimum_length    = 8
  password_require_lowercase = true
  password_require_numbers   = true
  password_require_symbols   = true
  password_require_uppercase = true
  schema = [
    {
      attribute_data_type = "String"
      name                = "email"
      required            = true
    }
  ]
  verification_message_template_default_email_option = "CONFIRM_WITH_CODE"
  verification_email_subject                         = "Verify your email for Dicom Processing"
  verification_email_message                         = "Your verification code is {####}"
  user_pool_clients = [
    {
      name                                 = "dicom_processing_client"
      generate_secret                      = false
      explicit_auth_flows                  = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
      allowed_oauth_flows_user_pool_client = true
      allowed_oauth_flows                  = ["code", "implicit"]
      allowed_oauth_scopes                 = ["email", "openid"]
      callback_urls                        = ["https://example.com/callback"]
      logout_urls                          = ["https://example.com/logout"]
      supported_identity_providers         = ["COGNITO"]
    }
  ]
}

#  Lambda SQS event source mapping
resource "aws_lambda_event_source_mapping" "sqs_event_trigger" {
  event_source_arn                   = module.dicom_processing_sqs.arn
  function_name                      = module.dicom_processing_function.arn
  enabled                            = true
  batch_size                         = 10
  maximum_batching_window_in_seconds = 60
}

# -----------------------------------------------------------------------------------------
# S3 Configuration
# -----------------------------------------------------------------------------------------
module "source_bucket" {
  source      = "./modules/s3"
  bucket_name = "dicom-media-source-bucket"
  objects = [
    {
      key    = "images/"
      source = ""
    }
  ]
  versioning_enabled = "Enabled"
  cors = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET"]
      allowed_origins = ["*"]
      max_age_seconds = 3000
    },
    {
      allowed_headers = ["*"]
      allowed_methods = ["PUT"]
      allowed_origins = ["*"]
      max_age_seconds = 3000
    }
  ]
  bucket_policy = ""
  force_destroy = false
  bucket_notification = {
    queue           = []
    lambda_function = []
  }
}

module "destination_bucket" {
  source      = "./modules/s3"
  bucket_name = "dicom-media-destination-bucket"
  objects = [
    {
      key    = "images/"
      source = ""
    }
  ]
  versioning_enabled = "Enabled"
  cors = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET"]
      allowed_origins = ["*"]
      max_age_seconds = 3000
    },
    {
      allowed_headers = ["*"]
      allowed_methods = ["PUT"]
      allowed_origins = ["*"]
      max_age_seconds = 3000
    }
  ]
  bucket_policy = jsonencode({
    "Version" : "2012-10-17",
    "Id" : "PolicyForCloudFrontPrivateContent",
    "Statement" : [
      {
        "Sid" : "AllowCloudFrontServicePrincipal",
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "cloudfront.amazonaws.com"
        },
        "Action" : "s3:GetObject",
        "Resource" : "${module.destination_bucket.arn}/*",
        "Condition" : {
          "StringEquals" : {
            "AWS:SourceArn" : "${module.dicom_media_cloudfront_distribution.arn}"
          }
        }
      }
    ]
  })
  force_destroy = false
  bucket_notification = {
    queue           = []
    lambda_function = []
  }
}

# -----------------------------------------------------------------------------------------
# Lambda distribution
# -----------------------------------------------------------------------------------------

# Dicom function IAM  Role
module "dicom_function_iam_role" {
  source             = "./modules/iam"
  role_name          = "dicom_function_iam_role"
  role_description   = "dicom_function_iam_role"
  policy_name        = "dicom_function_iam_policy"
  policy_description = "dicom_function_iam_policy"
  assume_role_policy = <<EOF
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "sts:AssumeRole",
                "Principal": {
                  "Service": "lambda.amazonaws.com"
                },
                "Effect": "Allow",
                "Sid": ""
            }
        ]
    }
    EOF
  policy             = <<EOF
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents"
                ],
                "Resource": "arn:aws:logs:*:*:*",
                "Effect": "Allow"
            }
        ]
    }
    EOF
}

module "dicom_processing_function_code" {
  source      = "./modules/s3"
  bucket_name = "dicom-processing-function-code"
  objects = [
    {
      key    = "dicom_processing.zip"
      source = "./files/dicom_processing.zip"
    }
  ]
  bucket_policy = ""
  cors = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET"]
      allowed_origins = ["*"]
      max_age_seconds = 3000
    }
  ]
  versioning_enabled = "Enabled"
  force_destroy      = false
}

# API Authorizer Function Code Bucket
module "dicom_processing_api_authorizer_function_code_bucket" {
  source      = "./modules/s3"
  bucket_name = "dicom-processing-api-authorizer-function-code"
  objects = [
    {
      key    = "api_authorizer.zip"
      source = "./files/api_authorizer.zip"
    }
  ]
  versioning_enabled = "Enabled"
  cors = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["PUT", "POST", "GET"]
      allowed_origins = ["*"]
      max_age_seconds = 3000
    }
  ]
  force_destroy = true
}

# Dicom processing function
module "dicom_processing_function" {
  source        = "./modules/lambda"
  function_name = "dicom-processing-function"
  role_arn      = module.dicom_function_iam_role.arn
  permissions   = []
  env_variables = {}
  handler       = "dicom_processing.lambda_handler"
  runtime       = "python3.12"
  s3_bucket     = module.dicom_processing_function_code.bucket
  s3_key        = "lambda.zip"
}

# Lambda authorizer function for API Gateway
module "dicom_processing_api_authorizer_function" {
  source        = "./modules/lambda"
  function_name = "dicom-processing-api-authorizer-function"
  role_arn      = module.dicom_function_iam_role.arn
  env_variables = {
    USER_POOL_ID  = module.cognito.user_pool_id
    APP_CLIENT_ID = module.cognito.client_ids[0]
    REGION        = var.region
  }
  permissions = [
    {
      statement_id = "AllowAPIGatewayInvoke"
      action       = "lambda:InvokeFunction"
      principal    = "apigateway.amazonaws.com"
      source_arn   = "${aws_api_gateway_rest_api.dicom_processing_rest_api.execution_arn}/*/*/*"
    }
  ]
  handler    = "api_authorizer.lambda_handler"
  runtime    = "python3.12"
  s3_bucket  = module.dicom_processing_api_authorizer_function_code_bucket.bucket
  s3_key     = "api_authorizer.zip"
  depends_on = [module.dicom_processing_api_authorizer_function_code_bucket]
}

# -----------------------------------------------------------------------------------------
# Cloudfront distribution
# -----------------------------------------------------------------------------------------
module "dicom_media_cloudfront_distribution" {
  source                                = "./modules/cloudfront"
  distribution_name                     = "dicom_media_cdn"
  oac_name                              = "dicom_media_cdn_oac"
  oac_description                       = "dicom_media_cdn_oac"
  oac_origin_access_control_origin_type = "s3"
  oac_signing_behavior                  = "always"
  oac_signing_protocol                  = "sigv4"
  enabled                               = true
  origin = [
    {
      origin_id           = "dicommediadestinationbucket"
      domain_name         = "dicommediadestinationbucket.s3.${var.region}.amazonaws.com"
      connection_attempts = 3
      connection_timeout  = 10
    }
  ]
  compress                       = true
  smooth_streaming               = false
  target_origin_id               = "dicommediadestinationbucket"
  allowed_methods                = ["GET", "HEAD"]
  cached_methods                 = ["GET", "HEAD"]
  viewer_protocol_policy         = "redirect-to-https"
  min_ttl                        = 0
  default_ttl                    = 86400
  max_ttl                        = 31536000
  price_class                    = "PriceClass_100"
  forward_cookies                = "all"
  cloudfront_default_certificate = true
  geo_restriction_type           = "none"
  query_string                   = true
}

# Frontend Module
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# VPC Configuration
module "vpc" {
  source                = "./modules/vpc/vpc"
  vpc_name              = "vpc"
  vpc_cidr_block        = "10.0.0.0/16"
  enable_dns_hostnames  = true
  enable_dns_support    = true
  internet_gateway_name = "vpc_igw"
}

# Security Group
module "security_group" {
  source = "./modules/vpc/security_groups"
  vpc_id = module.vpc.vpc_id
  name   = "security-group"
  ingress = [
    {
      from_port       = 80
      to_port         = 80
      protocol        = "tcp"
      self            = "false"
      cidr_blocks     = ["0.0.0.0/0"]
      security_groups = []
      description     = "any"
    },
    {
      from_port       = 22
      to_port         = 22
      protocol        = "tcp"
      self            = "false"
      cidr_blocks     = ["0.0.0.0/0"]
      security_groups = []
      description     = "any"
    }
  ]
  egress = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

# Public Subnets
module "public_subnets" {
  source = "./modules/vpc/subnets"
  name   = "public-subnet"
  subnets = [
    {
      subnet = "10.0.1.0/24"
      az     = "us-east-1a"
    },
    {
      subnet = "10.0.2.0/24"
      az     = "us-east-1b"
    },
    {
      subnet = "10.0.3.0/24"
      az     = "us-east-1c"
    }
  ]
  vpc_id                  = module.vpc.vpc_id
  map_public_ip_on_launch = true
}

# Private Subnets
module "private_subnets" {
  source = "./modules/vpc/subnets"
  name   = "private-subnet"
  subnets = [
    {
      subnet = "10.0.6.0/24"
      az     = "us-east-1d"
    },
    {
      subnet = "10.0.5.0/24"
      az     = "us-east-1e"
    },
    {
      subnet = "10.0.4.0/24"
      az     = "us-east-1f"
    }
  ]
  vpc_id                  = module.vpc.vpc_id
  map_public_ip_on_launch = false
}

# Public Route Table
module "public_rt" {
  source  = "./modules/vpc/route_tables"
  name    = "public-route-table"
  subnets = module.public_subnets.subnets[*]
  routes = [
    {
      cidr_block     = "0.0.0.0/0"
      gateway_id     = module.vpc.igw_id
      nat_gateway_id = ""
    }
  ]
  vpc_id = module.vpc.vpc_id
}

# Private Route Table
module "private_rt" {
  source  = "./modules/vpc/route_tables"
  name    = "private-route-table"
  subnets = module.private_subnets.subnets[*]
  routes  = []
  vpc_id  = module.vpc.vpc_id
}

# EC2 IAM Instance Profile
data "aws_iam_policy_document" "instance_profile_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "instance_profile_iam_role" {
  name               = "instance-profile-role"
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.instance_profile_assume_role.json
}

data "aws_iam_policy_document" "instance_profile_policy_document" {
  statement {
    effect    = "Allow"
    actions   = ["s3:*"]
    resources = ["*"]
  }
  statement {
    effect    = "Allow"
    actions   = ["cloudwatch:*"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "instance_profile_s3_policy" {
  role   = aws_iam_role.instance_profile_iam_role.name
  policy = data.aws_iam_policy_document.instance_profile_policy_document.json
}

resource "aws_iam_instance_profile" "iam_instance_profile" {
  name = "iam-instance-profile"
  role = aws_iam_role.instance_profile_iam_role.name
}

module "frontend_instance" {
  source                      = "./modules/ec2"
  name                        = "frontend-instance"
  ami_id                      = data.aws_ami.ubuntu.id
  instance_type               = "t2.micro"
  key_name                    = "madmaxkeypair"
  associate_public_ip_address = true
  user_data                   = filebase64("${path.module}/scripts/user_data.sh")
  instance_profile            = aws_iam_instance_profile.iam_instance_profile.name
  subnet_id                   = module.public_subnets.subnets[0].id
  security_groups             = [module.security_group.id]
}

# API Gateway configuration
resource "aws_api_gateway_rest_api" "dicom_processing_rest_api" {
  name = "dicom-processing-api"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Authorizer Resource
resource "aws_api_gateway_authorizer" "cognito_authorizer" {
  name            = "dicom-processing-cognito-authorizer"
  rest_api_id     = aws_api_gateway_rest_api.dicom_processing_rest_api.id
  authorizer_uri  = module.dicom_processing_api_authorizer_function.invoke_arn
  identity_source = "method.request.header.Authorization"
  type            = "REQUEST"
}

resource "aws_api_gateway_resource" "dicom_processing_resource_api" {
  rest_api_id = aws_api_gateway_rest_api.dicom_processing_rest_api.id
  parent_id   = aws_api_gateway_rest_api.dicom_processing_rest_api.root_resource_id
  path_part   = "api"
}

# ---------------------------------------------------------------------------------------------------

resource "aws_api_gateway_method" "dicom_processing_resource_api_get_records_method" {
  rest_api_id      = aws_api_gateway_rest_api.dicom_processing_rest_api.id
  resource_id      = aws_api_gateway_resource.dicom_processing_resource_api.id
  api_key_required = false
  http_method      = "GET"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "dicom_processing_resource_api_get_records_method_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dicom_processing_rest_api.id
  resource_id             = aws_api_gateway_resource.dicom_processing_resource_api.id
  http_method             = aws_api_gateway_method.dicom_processing_resource_api_get_records_method.http_method
  integration_http_method = "GET"
  type                    = "AWS_PROXY"
  uri                     = module.dicom_processing_get_records_function.invoke_arn
}

resource "aws_api_gateway_method_response" "dicom_processing_get_records_method_response_200" {
  rest_api_id = aws_api_gateway_rest_api.dicom_processing_rest_api.id
  resource_id = aws_api_gateway_resource.dicom_processing_resource_api.id
  http_method = aws_api_gateway_method.dicom_processing_resource_api_get_records_method.http_method
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "get_records_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.dicom_processing_rest_api.id
  resource_id = aws_api_gateway_resource.dicom_processing_resource_api.id
  http_method = aws_api_gateway_method.dicom_processing_resource_api_get_records_method.http_method
  status_code = aws_api_gateway_method_response.dicom_processing_get_records_method_response_200.status_code
  depends_on = [
    aws_api_gateway_integration.dicom_processing_resource_api_get_records_method_integration
  ]
}

resource "aws_api_gateway_deployment" "dicom_processing_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.dicom_processing_rest_api.id
  lifecycle {
    create_before_destroy = true
  }
  depends_on = [aws_api_gateway_integration.dicom_processing_resource_api_get_records_method_integration]
}

resource "aws_api_gateway_stage" "dicom_processing_api_stage" {
  deployment_id = aws_api_gateway_deployment.dicom_processing_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.dicom_processing_rest_api.id
  stage_name    = "dev"
}

# resource "aws_api_gateway_method_settings" "dicom_processing_api_method_settings" {
#   rest_api_id = aws_api_gateway_rest_api.dicom_processing_rest_api.id
#   stage_name  = aws_api_gateway_stage.dicom_processing_api_stage.stage_name
#   method_path = "${aws_api_gateway_resource.dicom_processing_resource_api.path_part}/${aws_api_gateway_method.dicom_processing_resource_api_get_records_method.http_method}"

#   settings {
#     metrics_enabled = true
#     logging_level   = "INFO"
#     data_trace_enabled = true
#   }
# }