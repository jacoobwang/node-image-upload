/*
wangyong, 2016-06-23
size选项: contain: 等比缩放并拉伸, 图片全部显示; cover: 等比缩放并拉伸, 图片完全覆盖容器; auto 图片不拉伸, 居中显示
fill: 图片小于缩略图尺寸时, 是否填充(false: 缩略图宽高自动缩放到适应图片, true: 缩略图尺寸不变)
stretch: 小图是否强制拉伸以适应缩略图的尺寸(size = auto/contain时)
注意: 添加图片水印不能使用跨域的图片
最好在 http开头的地址 下测试
http://localhost:8080/create
*/

(function(window, $, undefined) {
    'use strict';
    $.support.filereader = !!(window.File && window.FileReader && window.FileList && window.Blob);
    var setting = {
        width: 0, // thumbnail width
        height: 0, //thumbnail height
        background: '#fff', // fill color‎
        type: 'image/jpeg', // mime-type for thumbnail ('image/jpeg' | 'image/png')
        size: 'contain', // CSS3 background-size: contain | cover | auto
        mark: {}, // watermark
        // mark = {padding: 5, height: 18, text: 'test', color: '#000', font: '400 18px Arial'} // font: normal, bold, italic
            // bgColor: '#ccc' (background color); bgPadding: 5 (padding)
        // image watermark. (Note: cross-domain is not allowed)
        // mark = {padding: 5, src: 'mark.png', width: 34, height: 45};
        before: null, // call function before process image.
        done: null, // success function: call function after thumbnail has been created.
        fail: null, // error function
        always: null // complete function(done|fail)
    };
    
    var $body = $('body');
    var IMG_FILE = /image.*/; // var TEXT_FILE = /text.*/;
    var dataURItoBlob = function (dataURI, mime) { // convert base64 to raw binary data
        var blob;
        // BlobBuilder and ArrayBuffer are now deprecated
        // github.com/blueimp/JavaScript-Canvas-to-Blob 
        // stackoverflow.com/q/15639070/2305701
        var support = !!($.support.filereader && window.Uint8Array); //|| window.ArrayBuffer, window.FormData
        if (!support) return blob;

        var arr = dataURI.split(',');
        var byteString = atob(arr[1]); // decodeURI(arr[1])
        mime = mime || arr[0].split(':')[1].split(';')[0] || 'image/jpeg';

        // var ab = new ArrayBuffer(byteString.length);var ia = new Uint8Array(ab); blob = new Blob([ab], { type: mime });
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        // write the ArrayBuffer to a blob, and you're done
        blob = new Blob([ia], { type: mime });
        return blob;
    };

    //原图保存到服务器
    var saveOriginToDisk = function(dataURI, filename, cb) {
        var dataURI = dataURI.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        $.ajax({
            url: '/api/upload',
            data: 'img='+encodeURIComponent(dataURI)+'&type=origin&file='+filename,
            type: 'POST',
        }).done(function(data) {
            if ($.isFunction(cb)) cb();
            console.log(data);
        });
    };

    $.fn.makeThumb = function(options) {
        var opts = {};
        $.extend(opts, setting, options);
        var $self = this;

        if (!$.support.filereader) return;
        var size = opts.size;
        var before = opts.before,
            always = opts.always || opts.complete,
            done = opts.done || opts.success,
            fail = opts.fail || opts.error;

        $self.change(function() {
            var self = this;
            var files = self.files;
            var dataURL = '', blob;

            if ($.isFunction(before)) before();
            if (!files.length) {
                if ($.isFunction(fail)) fail.apply(self, []);
                if ($.isFunction(always)) always();
                return;
            }

            var file = files[0];
            var fr = new FileReader();
            
            // create <canvas>
            var $canvas = $('<canvas></canvas>'),
                canvas = $canvas[0],
                context = canvas.getContext('2d');
            var image, fEvt;
           
            if (IMG_FILE.test(file.type)) {
                fr.onerror = function(fEvent) { // error callback
                    fEvt = fEvent;
                    if ($.isFunction(fail)) fail.apply(self, [file, fEvt]);
                    if ($.isFunction(always)) always();
                };
                fr.onload = function(fEvent) { // onload success
                    fEvt = fEvent;
                    var target = fEvt.target;
                    var result = target.result;

                    var cb = function(){
                        // load img
                        image = new Image();
                        image.src = result;
                        image.onerror = function(){
                            if ($.isFunction(fail)) fail.apply(self, [file]);
                            if ($.isFunction(always)) always();
                        };
                        image.onload = function() {
                            canvas.width = opts.width;
                            canvas.height = opts.height;
                            context.clearRect(0, 0, opts.width, opts.height);
                            context.drawImage(image, 0, 0, opts.width, opts.height);
                            $body.append($canvas);

                            if ($.isFunction(done)) {
                                var dataURL = canvas.toDataURL();
                                //var blob  = dataURItoBlob(dataURL);
                                done.apply(self, [dataURL, '', file.name, fEvt]);
                            }
                            always();
                        };
                    }
                    saveOriginToDisk(result , file.name , cb);   
                };
                fr.readAsDataURL(file);
            }
        });
    };
})(window, jQuery);
