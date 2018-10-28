var $input = document.getElementById('imagefiles');
if (window.File && window.FileReader && window.FileList && window.Blob) {
  $input.addEventListener('change', handleFileSelect, false);
}
function handleFileSelect (e) {
  var target = e.currentTarget;
  if (!target) { return; }
  var files = target.files;
  if (!files) { return; }
  for (var i = 0, l = files.length; i<l; i++) {
    var f = files[i];
    if (!f.type.match('image.*')) { continue; }
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        // Render thumbnail.
        var p = document.createElement('p');
        p.innerHTML = ['<img class="thumb" src="', e.target.result,
                          '" title="', escape(theFile.name), '"/>'].join('');
        document.getElementById('list').insertBefore(p, null);
        var fileData = e.target.result.split(',')[1];
        $.ajax('/create_image_note', {
          dataType: 'json',
          method: 'POST',
          data: {
            //fileB64: fileData,
            fileData: fileData,
            fileName: theFile.name,
            fileType: theFile.type,
            fileSize: theFile.size
          },
          success: function (res) {
            console.log(arguments);
          },
          error: function () {
            console.log(arguments);
          }
        })
      };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
}
