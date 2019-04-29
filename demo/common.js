if (/debug/.test(location.search)) {
  localStorage.debug = 'app:*';
}
var debug = localStorage.debug;
if (debug) {
  console.log('启用debug模式，使用amd_modules中的模块');
} else {
  console.log('使用在线npm包，如果未发布到在线，apmjs install后，可以使用?debug参数进行本地包调试');
}
require.config({
  baseUrl: debug ? 'amd_modules' : '//unpkg.zhimg.com',
    paths: {
        // 强制etpl在任何使用使用线上版本
        "etpl": '//unpkg.zhimg.com/etpl'
    },
    waitSeconds: 30
});

// apmjs auto-creates these entries when installed locally
define('etpl', function (require) {
  return require('etpl/src/main');
});
define('versions-compare', function (require) {
  return require('versions-compare/src/index');
});
if (debug) {
  define('demo', function (require) {
    return require('../../dist/index');
  });
  console.log('使用了本地dist目录的编译产出模块');
} else {
  define('demo', function (require) {
    return require('demo/dist/index');
  });
  console.log('使用了在线的编译产出模块');
}


require(
    ['etpl', 'versions-compare', 'demo'],
    function(Etpl, VC, Demo) {
    Etpl.config({
        commandOpen: "<%",
        commandClose: "%>"
    });
    console.log('ETPL', Etpl);
    console.log('versions-compare', VC);
    console.log('DEMO', Demo);
    var service = new Demo.Service();
    service.set('Music Demo');
    mtitle.value = 'Music Demo';
    mtitle.onchange = function() {
      service.set(mtitle.value);
    }
    document.querySelectorAll('.con').forEach(function(item) {
      var demo = new Demo.Player(item, service);
    });



});
