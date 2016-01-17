/**
 * Created by jazalizil on 13/01/2016.
 */

var API_URL = "http://localhost:3000/";

toastr.options = {
  'timeOut': 2500
};

// File upload
var file, files = [], tmpFiles = [];

function triggerInput() {
  $('#file_choose').click();
}

function prepareUpload(ev) {
  if (typeof ev.target.files[0] !== 'undefined') {
    file = ev.target.files[0];
    $('#file_name').val(file.name);
    $('#file_upload_btn').html('upload').attr('onclick', 'upload()');
    $('.file_select').removeClass('hidden');
  }
}

function upload() {
  var data = new FormData();
  data.append("file", file);
  $.ajax({
    url: API_URL + 'upload/',
    method: 'POST',
    data: data,
    dataType: 'json',
    processData: false,
    contentType: false
  }).done(function(f){
    console.log(f);
    files.push(f);
    addFileToList($('.portfolioContainer'), f);
  });
}

$('#file_choose').on('change', prepareUpload);

// File download
function fetchClusters(datas, content) {

  var fetchCluster = function(data){
    return $.ajax({
      url: data.url,
      data: {
        blockSize: data.blockSize,
        blockPosition: data.blockPosition
      }
    }).then(function(res){
      console.log('bytes received :', res.length);
      $('#' + data.clusterId).children().attr('class', 'fa fa-check');
      content.push({
        buf : res,
        position: data.blockPosition
      });
    });
  };
  return $.map(datas, fetchCluster);
}

function sortDataByPosition(a, b) {
  return a.position < b.position ? -1 : 1;
}

function download(ev) {
  var fileId = ev.currentTarget.id;
  $.ajax({
    url: API_URL + 'download/' + fileId,
    context: document.body
  }).done(function(res) {
    var fileContent = [];
    $('#downloadModal').modal();
    $('#fileName').text(res.name);
    $('#nbCluster').text(res.datas.length);
    var progressCtn = $('#progress-ctn').html('');
    for(var i=0; i < res.datas.length; i++) {
      var clusterId = res.datas[i].clusterId;
      progressCtn.append('<div class="col-xs-3">' +
        '<div class="row centered">Server <div class="small">' + clusterId +'</div></div>' +
        '<div class="row centered" id="' + clusterId + '"><i class="fa fa-spinner fa-spin"></i></div>' +
        '</div>');
    }
    var promises = fetchClusters(res.datas, fileContent);
    $.when.apply($, promises).done(function(){
      $('#download-spinner').attr('class', '').text('Downloaded !');
      fileContent = fileContent.sort(sortDataByPosition);
      console.warn(fileContent);
      var fileBinaryContent = [];
      for (var i = 0; i < fileContent.length; i++) {
        for (var j=0; j < fileContent[i].buf.length; j++) {
          fileBinaryContent.push(fileContent[i].buf.charCodeAt(j));
        }
      }
      var blob = new Blob([new Uint8Array(fileBinaryContent)], {
        type: res.mimeType
      });
      var link = document.getElementById('download-link');
      link.href = URL.createObjectURL(blob);
      link.download = res.name;
      link.click();
      fileContent = [];
    });
  })
    .fail(function(err){
      if (err.status === 442) {
        toastr.error('No server available');
      } else if (err.status === 412) {
        toastr.warning('This file is still uploading');
      }
    });
}

// Files list
var filter = 'all';
var fileTypesToHtml = {
  image: {
    mainClass: 'photo',
    subClass: 'tile-teal',
    iconClass: 'fa fa-file-image-o'
  },
  video: {
    mainClass: 'video',
    subClass: 'tile-teal',
    iconClass: 'fa fa-file-video-o'
  },
  all: {
    mainClass: 'file',
    subClass: 'tile-green',
    iconClass: 'fa fa-file-o'
  }
};
// http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
function fileSizeSI(a,b,c,d,e){
  return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
    +' '+(e?'kMGTPEZY'[--e]+'B':'Bytes')
}

function addFileToList(listSelector, file, uploading) {
  var fileType = fileTypesToHtml[file.mimeType.split('/')[0]];
  var html = fileType ? fileType : fileTypesToHtml['all'];
  var fileSize = fileSizeSI(file.size);
  var fileName = file.name;
  if (fileName.length >= 15) {
    var pointIndex = fileName.indexOf('.');
    fileName = fileName.substring(0, 12) + '..' + fileName.substr(pointIndex);
  }
  var portfolio = $('<div class="animated bounceInRight ' + html.mainClass + '">' +
    '<div class="thumbnail tile tile-medium col ' + html.subClass + '">' +
    '</div></div>');
  var link = $('<a class="item" href="#" id="' + file._id + '">' +
    '<h1 class="tile-text row">' +
    '<i class="' + html.iconClass + '"></i>' +
    '</h1>' +
    '<p class="row">' + fileName + '</p>' +
    '<p class="row">' + fileSize +'</p></a>');
  link.click(download);
  portfolio.children().append(link);
  listSelector.append(portfolio);
}

function filterList() {
  var index, file;
  var listSelector = $('.portfolioContainer').html('');
  files = tmpFiles;
  for(var i = 0; i < files.length; i++) {
    file = files[i];
    if (typeof filter !== 'undefined' && filter !== 'all') {
      index = file.mimeType.indexOf(filter);
      if (index > -1) {
        addFileToList(listSelector, file);
      }
    }
    else {
      addFileToList(listSelector, file);
    }
  }
}

function setFilter(f) {
  filter = f === '*' ? 'all' : f.substring(1);
  filterList();
}



function list() {
  $.ajax({
    url: API_URL + 'list/',
    context: document.body
  }).done(function(res){
    files = res;
    tmpFiles = res;
    filterList();
  });
}
list();
$('.portfolioFilter > a').click(function(){
  var ev = $(this);
  setFilter(ev.attr('data-filter'));
  refreshPortfolio(ev);
});