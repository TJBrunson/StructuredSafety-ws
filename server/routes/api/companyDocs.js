const express = require("express");
const aws = require("aws-sdk");
const config = require("../../../config.json");

const router = express.Router();

//AWS setup
aws.config.setPromisesDependency();
    aws.config.update({
      accessKeyId: config.aws.accessKey,
      secretAccessKey: config.aws.secretKey,
      region: config.aws.region,
    });

const s3 = new aws.S3();


//Get all keys for a given company name
router.get("/:companyName/", async (req, res) => {
  const companyDocs = await loadCompanyDocs(req.params.companyName);
  res.send(await companyDocs.Contents);
});

//Handles S3 call to list objects with a passed in prefix of a company name
async function loadCompanyDocs(companyName) {
  try {
    const response = await s3
      .listObjectsV2({
        Bucket: config.aws.companyBucket,
        Prefix: companyName,
      })
      .promise();

    return response;
  } catch (e) {
    console.error(e);
  }
}

//return a file as a download based on a passed in key
router.get("/get-file/:key", async (req, res) => {
    s3.getObject({Bucket: config.aws.companyBucket, Key: req.params.key})
    .on('httpHeaders', function (statusCode, headers) {
        res.set('Content-Length', headers['content-length']);
        res.set('Content-Type', headers['content-type']);
        this.response.httpResponse.createUnbufferedStream()
            .pipe(res);
    })
    .send();
});

module.exports = router;
