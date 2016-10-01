var fs = require('fs');
var path = require('path');
var bucket = process.argv[2] || "{{your bucket name}}";
var source = process.argv[3] || "./dist";
var replace_destination_haed = process.argv[4] || "dist";

var credentials_path = path.join(
    process.env.HOME,
    '.aws/credentials-' + bucket + '.txt'
);

if (fs.existsSync(credentials_path)) {
    var credentials = fs.readFileSync(credentials_path, 'utf-8');
    var data = {};
    credentials.replace(/\r/g, '').split('\n').forEach(function (credential) {
        var temp = credential.split('=');
        data[temp[0]] = temp[1];
    });
    __dirname = path.join(__dirname, 'dist');
    process.argv = [
        process.argv[0],
        process.argv[1],
        '-a',
        data["Key"],
        '-s',
        data["Secret"],
        '-b',
        bucket,
        '-d',
        source
    ];
    var s3pusher = require('./s3-pusher');
    new s3pusher(replace_destination_haed);
}
else {
    console.log('you not credentials file in ' + credentials_path);
}