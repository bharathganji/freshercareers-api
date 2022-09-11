const express = require('express')
const { spawn } = require('child_process')
const app = express()
const port = 3000
const path = require('path');
const fs = require('fs');



app.get('/', (req, res) => {
  let dataToSend
  let largeDataSet = []
  // spawn new child process to call the python script
  const python = spawn('python3', ['./main.py'])

  // collect data from script
  python.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...')
    //dataToSend =  data;
    largeDataSet.push(data)
  })

  // in close event we are sure that stream is from child process is closed
  python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`)
    // send data to browser
    res.send(largeDataSet.join(''))
  })
})
// __dirname='output/data'
// app.use(express.static(path.join(__dirname, "freshercareersdotin_messages.json")));

const Transform = require('stream').Transform;
const parser = new Transform();
const newLineStream = require('new-line');

parser._transform = function(data, encoding, done) {
  let str = data.toString();
  str = str.replace('<html>', '<!-- Begin stream -->\n<html>');
  str = str.replace('</body>', '<script>var data = {"foo": "bar"};</script>\n</body>\n<!-- End stream -->');
  this.push(str);
  done();
};

// app creation code removed for brevity

app.use('/data.json', (req, res) => {
    fs
      .createReadStream('freshercareersdotin_messages.json')
      .pipe(newLineStream())
      .pipe(parser)
      .pipe(res);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
