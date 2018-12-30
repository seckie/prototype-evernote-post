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
    reader.onload = (handleOnloadAsDataURL)(f);
    reader.readAsDataURL(f);
    const formData = new FormData();
    formData.append('fileData', f);
    formData.append('fileName', f.name);
    formData.append('fileType', f.type);
    formData.append('fileSize', f.size);

    $.ajax('/create_image_note', {
      //dataType: 'json',
      method: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        console.log(arguments);
      },
      error: function () {
        console.log(arguments);
      }
    })
    /*
    var reader2 = new FileReader();
    reader2.onload = (handleOnloadAsArrayBuffer)(f);
    reader2.readAsArrayBuffer(f);
    */
  }
}

function handleOnloadAsDataURL (theFile) {
  return function (e) {
    // Render thumbnail.
    var p = document.createElement('p');
    p.innerHTML = ['<img class="thumb" src="', e.target.result,
      '" title="', escape(theFile.name), '"/>'].join('');
    document.getElementById('list').insertBefore(p, null);
  };
}
function handleOnloadAsArrayBuffer (theFile) {
  return function (e) {
    $.ajax('/create_image_note', {
      dataType: 'json',
      method: 'POST',
      data: {
        fileData: e.target.result,
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
}
