var fs = require('fs');
var exec = require('child_process').exec;
const Speech = require('@google-cloud/speech');

var counter = 0;
const recFile = 'file.flac';

fs.watch('./'+recFile, {encoding: 'buffer'}, function (eventType, filename) {
  if (filename) {
    console.log('filename provided: ' +filename + ' with type: ' + eventType);
  }
});

var runRecord = function () {

  const speech = Speech();

  exec("rec "+recFile+" silence 1 0.1 4% 4 0.5 4% rate 8000", function (error, stdout, stderr) {
    console.log('Got file');
    if (null === error) {
      counter++;
      var tmpFile = './tmp/'+counter+'_'+recFile;
      var fileStream = fs.createReadStream('./' + recFile);
      var wStream = fs.createWriteStream(tmpFile);
      fileStream.pipe(wStream);

      console.log('Moved File send to google, now');
      const request = {
        config: {
          encoding: 'FLAC',
          sampleRate: 16000
        }
      };

      const recognizeStream =speech.createRecognizeStream(request)
        .on('error', function (error) {
          console.log(error);
        })
        .on('data', function (data) {
          fs.unlink(tmpFile);

          console.log(data);
        });
      fs.createReadStream(tmpFile).pipe(recognizeStream);

    }

    if (error !== null) {
      console.log('exec error: ' + error);
    }

    fs.unlink('./'+recFile);
    runRecord()
  });
};

runRecord();
