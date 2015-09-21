/**
 * Created by yanjiaqi on 15/9/16.
 */
/// <reference path="../lib/types.d.ts" />
var TSP = require("./upgrade/2.4.2/TsServiceProxy");
var file = require('../lib/FileUtil');
var TSS = require("./upgrade/2.4.2/typescriptServices");
var utils = require('../lib/utils');
var DTS = require('./upgrade/2.4.2/compare2dts.js');
var AutoLogger = {
    _isConsoleOut: false,
    _htmlTitle: '<!DOCTYPE html><html><head><title>API检测结果报告</title><meta charset="UTF-8"></head><body>',
    _htmlBody: '',
    _htmlEnd: '</body></html>',
    _snapShot: '',
    _solutionMap: {},
    _dir: '',
    _total: 0,
    _isAPIadd: false,
    _api: null,
    _item: null,
    _logContent: {
        title: 'API Math.abs discarded,solution:http//www.baidu.com/Math.abs',
        isShow: true
    },
    _categoryQuickLST: {},
    init: function (ignorePath) {
        this._dir = ignorePath;
        this._total = 0;
        var solutionPath = file.joinPath(egret.root, '/tools/commands/upgrade/2.4.2', 'solution_urls.json');
        this._solutionMap = JSON.parse(file.read(solutionPath));
        this._snapShot = '';
    },
    close: function () {
        this.clear();
    },
    acceptCategory: function (item) {
        this._categoryQuickLST[item['category-name']] = item;
    },
    logTitle: function (item) {
        //拼title
        var titleStr;
        //无解决方案
        var no_solution = false;
        //是否输出
        var is_show = true;
        //有url确定title
        this._api = item['category-name'] + '.' + item['name'];
        if (item['solution-url']) {
            titleStr = 'API ' + this._api + ' 变更,解决方案请查看 ' + this._filterUrl(item['solution-url']);
            this._isAPIadd = false;
        }
        else 
        //无解决方案去查快表是否有解决方案
        if (item['category-name'] in this._categoryQuickLST) {
            var father_item = this._categoryQuickLST[item['category-name']];
            //快表有url
            if (father_item['solution-url']) {
                titleStr = 'API ' +
                    item['category-name'] + '.*' + ' 变更,解决方案请查看 ' + this._filterUrl(father_item['solution-url']);
                this._isAPIadd = true;
            }
            else {
                //快表无url查看快表的source属性
                if ('solved_name_change.json' == father_item['source']) {
                    titleStr = 'API ' + item['category-name'] + '.*' + ' 名称变更,尝试用\'$\'代替\'_\'';
                    this._isAPIadd = true;
                }
                else if ('solved_deprecated.json' == father_item['source']) {
                    titleStr = 'API ' + item['category-name'] + '.*' + ' 废弃,新版本不再提供兼容';
                    this._isAPIadd = true;
                }
                else if ('solved_right.json' == father_item['source']) {
                    //不输出
                    titleStr = 'no need output';
                    is_show = false;
                }
                else {
                    no_solution = true;
                }
            }
        }
        else {
            no_solution = true;
        }
        if (no_solution) {
            if ('solved_name_change.json' == item['soucre']) {
                titleStr = 'API ' + this._api + ' 名称改变,尝试用\'$\'代替\'_\'';
            }
            else if ('solved_deprecated.json' == item['source']) {
                titleStr = 'API ' + this._api + ' 废弃,新版本不再提供兼容。 ';
            }
            else if ('solved_right.json' == item['source']) {
                //不输出
                titleStr = 'no need output';
                is_show = false;
            }
            this._isAPIadd = false;
        }
        if (titleStr != this._logContent.title) {
            this.clear();
            this._logContent.title = titleStr;
            this._logContent.isShow = is_show;
        }
    },
    logRef: function (fileName, lineNum) {
        if (!this._logContent.references) {
            this._logContent.references = {};
        }
        if (!this._logContent.references[fileName]) {
            this._logContent.references[fileName] = {};
        }
        if (!this._logContent.references[fileName][this._api]) {
            this._logContent.references[fileName][this._api] = [];
        }
        this._logContent.references[fileName][this._api].push(lineNum);
        this._logContent.references[fileName][this._api].isAPIshow = this._isAPIadd;
    },
    clear: function () {
        var _this = this;
        //过滤掉只有title的情况
        if (this._logContent.title && this._logContent.references && this._logContent.isShow) {
            //step1
            if (this._isConsoleOut) {
                console.log(this._logContent.title);
            }
            this._snapShot += '\n' + this._logContent.title;
            this._htmlBody += '<ul class="solution"><h3>' + this._logContent.title + '</h3>';
            //step2
            var fileRefLine;
            var htmlRefLine;
            for (var file_path in this._logContent.references) {
                fileRefLine = file.getRelativePath(this._dir, file_path) + ' ';
                htmlRefLine = '<i>' + file.getRelativePath(this._dir, file_path) + '</i>';
                for (var api in this._logContent.references[file_path]) {
                    this._logContent.references[file_path][api].forEach(function (lineNum) {
                        //行号需要＋1
                        fileRefLine += (lineNum + 1) + ', ';
                        htmlRefLine += '<b>' + (lineNum + 1) + '</b>' + ', ';
                        _this._total++;
                    });
                    fileRefLine = fileRefLine.slice(0, fileRefLine.lastIndexOf(', ')) + '行处引用 ';
                    htmlRefLine = htmlRefLine.slice(0, htmlRefLine.lastIndexOf(', ')) + '行处引用 ';
                    if (this._logContent.references[file_path][api].isAPIshow) {
                        fileRefLine += api + ' ;';
                        htmlRefLine += api + ' ;';
                    }
                    ;
                }
                if (this._isConsoleOut) {
                    console.log(fileRefLine);
                }
                this._snapShot += '\n' + fileRefLine;
                this._htmlBody += '<li>' + htmlRefLine + '</li>';
            }
            if (this._isConsoleOut) {
                console.log('\n');
            }
            this._snapShot += '\n';
            this._htmlBody += '</ul>';
        }
        //清空_logContent对象
        this._logContent.title = null;
        delete this._logContent.references;
        delete this._api;
        this._isAPIadd = false;
        this.isShow = true;
    },
    _filterUrl: function (key) {
        if (key in this._solutionMap) {
            return '<a herf="' + this._solutionMap[key] + '">' + this._solutionMap[key] + '</a>';
        }
        else
            return key;
    }
};
var APItestCommand = (function () {
    function APItestCommand() {
        this.isAsync = true;
    }
    APItestCommand.prototype.execute = function () {
        var projectPath = egret.args.projectDir;
        //判断目录是否有效
        this.apiTest(projectPath);
        return DontExitCode;
    };
    APItestCommand.prototype.apiTest = function (projectPath) {
        //var open = globals.getOpen();
        //open("https://github.com/egret-labs/egret-core/tree/v2.4.2/docs/cn/2.4.2_ReleaseNotes.md");
        var _this = this;
        //var projectPath = this.createAndCopyProjectFile();
        var egretRoot = egret.root;
        //var egretPath = "/Users/yanjiaqi/workspace/main/new_1/egret";
        var libPath = file.joinPath(egretRoot, 'tools/commands/upgrade/2.4.2/libs'); //用自带的旧api检测
        //var libPath = file.joinPath(projectPath,'/libs');//
        var configPath = file.joinPath(egretRoot, 'tools/commands/upgrade/2.4.2/solved');
        var searchLST = DTS.load_format(configPath);
        if (searchLST) {
            console.log('API 冲突检测中...');
            //ts服务初始化设置
            var settings = {
                mapSourceFiles: true,
                sourceMap: true,
                target: 1 /* ES5 */
            };
            this.tsp = new TSP.TsServiceProxy(settings);
            this.tsp.setExceptDir(file.joinPath(projectPath, 'src/libs'));
            this.tsp.setDefaultLibFileName(file.joinPath(libPath, 'core', 'core.d'));
            this.tsp.initProject(projectPath);
            this.tsp.initLibs([libPath]);
            //初始化
            AutoLogger.init(projectPath);
            if ('quickLST' in searchLST) {
                for (var p in searchLST.quickLST) {
                    var item = searchLST.quickLST[p];
                    AutoLogger.acceptCategory(item);
                }
            }
            searchLST.forEach(function (item) {
                var searchName = item['name'];
                var fatherName = item['category-name'];
                //if(searchName == 'anchorX' && fatherName == 'DisplayObject' ||
                //    searchName == 'addEventListener' && fatherName == 'DisplayObject' ||
                //    searchName == '_setHeight' && fatherName == 'ScrollView'){
                //    var a;
                //}
                if (searchName == 'addEventListener') {
                    var a;
                }
                var pkg;
                //过滤＊
                if (searchName == '*') {
                    AutoLogger.acceptCategory(item);
                }
                else {
                    AutoLogger.logTitle(item);
                    //console.log(item.name+'.'+item['category-name']);
                    if (pkg = _this.tsp.getDeclarationPosition(fatherName, searchName)) {
                        _this.tsp.getAllReferenceAccordingDeclarationPosition(pkg.path, pkg.position, item['decorate'], fatherName, function (filePath, line) {
                            AutoLogger.logRef(filePath, line);
                            //console.log(filePath,line);
                        });
                    }
                }
            });
            AutoLogger.close();
            if (AutoLogger._snapShot != '') {
                //打开项目目录(异步方法)
                utils.open(projectPath, function (err, stdout, stderr) {
                    if (err) {
                        console.log(stderr);
                    }
                    //延时操作下一步
                    setTimeout(function () {
                        //写入html并打开网址
                        var saveContent = AutoLogger._htmlTitle +
                            '<h1>' + projectPath + '<b>v2.0.5</b>到<b>v2.4.3</b>API升级检测报告</h1><br>' +
                            '<h2>共计 <b>' + AutoLogger._total + '</b> 处冲突,请解决完所有冲突后再执行build</h2><br>' +
                            AutoLogger._htmlBody + AutoLogger._htmlEnd;
                        var saveContent = AutoLogger._snapShot;
                        if (saveContent != '') {
                            var saveLogFilePath = file.joinPath(projectPath, 'LOG_APITEST.html');
                            _this.saveFileAndOpen(saveLogFilePath, saveContent);
                            globals.log2(1712, saveLogFilePath);
                        }
                        sumUpAndEndProcess();
                    }, 200);
                });
            }
            else {
                sumUpAndEndProcess();
            }
        }
        else {
            globals.exit(1705);
        }
        //统计数据并退出
        function sumUpAndEndProcess() {
            //提示及退出
            if (AutoLogger._total === 0) {
                globals.exit(1702);
            }
            else {
            }
        }
    };
    APItestCommand.prototype.saveFileAndOpen = function (filePath, content) {
        file.save(filePath, content);
        utils.open(filePath);
    };
    return APItestCommand;
})();
module.exports = APItestCommand;

//# sourceMappingURL=../commands/apitest.js.map