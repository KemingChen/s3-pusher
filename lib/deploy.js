var fs = require('fs');
var colors = require("colors");
var path = require('path');
var bucket = process.argv[2] || "{{your bucket name}}";
var source = process.argv[3] || "./dist";

(function main() {
    var credentials_path = path.join(process.env.HOME, '.aws/credentials-' + bucket + '.txt');
    if (fs.existsSync(credentials_path)) {
        var credentials = fs.readFileSync(credentials_path, 'utf-8');
        var data = {};
        credentials.replace(/\r/g, '').split('\n').forEach(function(credential) {
            var temp = credential.split('=');
            data[temp[0]] = temp[1];
        });

        var key = data["Key"];
        var secret = data["Secret"];
        console.log("Key:".green, key.green);
        console.log("Secret:".green, secret.green);
        getBucketLocation(key, secret, function(region) {
            console.log("Region:".green, region.green);
            syncBucket(key, secret, region)
        });
    } else {
        console.log('you not credentials file in ' + credentials_path);
    }
})();

function getBucketLocation(key, secret, callback) {
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3({
        accessKeyId: key,
        secretAccessKey: secret,
    });
    s3.getBucketLocation({
        Bucket: bucket
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        } else {
            callback && callback(data.LocationConstraint);
        }
    });
}

function syncBucket(key, secret, region) {
    var s3 = require('s3');
    var client = s3.createClient({
        s3Options: {
            accessKeyId: key,
            secretAccessKey: secret,
            region: region,
        },
    });

    var params = {
        localDir: source,
        deleteRemoved: false,
        s3Params: {
            Bucket: bucket,
            Prefix: "",
        },
    };
    var uploader = client.uploadDir(params);
    uploader.on('error', function(err) {
        console.error(("unable to sync:" + err.stack).red);
    });
    uploader.on('progress', function() {
        console.log(("Progress: " + uploader.progressTotal + " of " + uploader.progressMd5Amount).yellow);
    });
    uploader.on('end', function() {
        console.log("done uploading".green);
    });
}
