var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var File = gutil.File;

// Consts
const PLUGIN_NAME = 'gulp-srcToVariable';

var srcToVariable = function srcToVariable(varName, asMap, namingCallback) {
    
    var content;
    var firstFile;
    
    namingCallback = namingCallback || function(filename) { return filename; };
    
    function bufferContents(file, enc, cb) {
    // ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // no stream support, only files.
    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));
      cb();
      return;
    }

    // set first file if not already set
    if (!firstFile) {
      firstFile = file;
    }

    // construct concat instance
    if (!content) {
      content = asMap ? {} : "";
    }
    // add file to concat instance
    if(asMap) {
        var name = namingCallback(file.relative);
        
        content[name] = file.contents.toString();
    } else {
        content += file.contents.toString();
    }
    cb();
  }

  function endStream(cb) {
    if (!firstFile || !content) {
      cb();
      return;
    }

    
    var joinedPath = path.join(firstFile.base, varName);

    var joinedFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: joinedPath,
      contents: new Buffer(varName + '=' + JSON.stringify(content) + ';')
    });
    
    this.push(joinedFile);
    
    
    cb();
  }

  return through.obj(bufferContents, endStream);
    
}

module.exports = srcToVariable;