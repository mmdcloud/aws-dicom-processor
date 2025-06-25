import boto3
import os

client = boto3.client('medical-imaging')

def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        
        response = client.start_import_job(
            datastoreId=os.environ['DATASTORE_ID'],
            jobName=f"import-{key.replace('/','-')}",
            inputConfig={
                's3Uri': f"s3://{bucket}/{key}"
            },
            outputConfig={
                's3Uri': f"s3://{bucket}-processed/import-results/"
            },
            clientToken=context.aws_request_id
        )
        print(f"Started import job {response['jobId']}")