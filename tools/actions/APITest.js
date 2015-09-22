/**
 * Created by yanjiaqi on 15/9/22.
 */
/// <reference path="../lib/types.d.ts" />
var TSP = require("../commands/upgrade/2.4.2/TsServiceProxy");
var file = require('../lib/FileUtil');
var TSS = require("../commands/upgrade/2.4.2/typescriptServices");
var DTS = require('../commands/upgrade/2.4.2/compare2dts.js');
var AutoLogger = (function () {
    function AutoLogger() {
        this._isConsoleOut = false;
        this._htmlTitle = '<!DOCTYPE html><html><head><title>API检测结果报告</title><meta charset="UTF-8"></head><body>';
        this._htmlBody = '';
        this._htmlEnd = '</body></html>';
        this._snapShot = '';
        this._solutionMap = {};
        this._dir = '';
        this._total = 0;
        this._isAPIadd = false;
        this._api = null;
        //private _item:null,
        this._logContent = {
            title: 'API Math.abs discarded,solution:http//www.baidu.com/Math.abs',
            isShow: true,
            isAPIadd: false
        };
        this._categoryQuickLST = {};
    }
    Object.defineProperty(AutoLogger.prototype, "total", {
        get: function () {
            return this._total;
        },
        enumerable: true,
        configurable: true
    });
    AutoLogger.getInstance = function () {
        if (!AutoLogger._instance) {
            AutoLogger._instance = new AutoLogger();
        }
        return AutoLogger._instance;
    };
    AutoLogger.prototype.init = function (ignorePath) {
        this._dir = ignorePath || '';
        this._total = 0;
        var solutionPath = file.joinPath(egret.root, '/tools/commands/upgrade/2.4.2', 'solution_urls.json');
        this._solutionMap = JSON.parse(file.read(solutionPath));
        this._snapShot = '';
    };
    AutoLogger.prototype.close = function () {
        this.clear();
    };
    AutoLogger.prototype.acceptCategory = function (item) {
        this._categoryQuickLST[item['category-name']] = item;
    };
    AutoLogger.prototype.logTitle = function (item) {
        //拼title
        var titleStr;
        //无解决方案
        var no_solution = false;
        //是否输出
        var is_show = true;
        //是否写API全称
        var isAPIadd = false;
        //有url确定title
        this._api = item['category-name'] + '.' + item['name'];
        if (item['solution-url']) {
            titleStr = 'API ' + this._api + ' 变更,解决方案请查看 ' + this._filterUrl(item['solution-url']);
            isAPIadd = false;
        }
        else 
        //无解决方案查看是否来源为正确
        if ('solved_right.json' == item['source']) {
            //不输出
            titleStr = 'no need output';
            is_show = false;
        }
        else 
        //无解决方案去查快表是否有解决方案
        if (item['category-name'] in this._categoryQuickLST) {
            var father_item = this._categoryQuickLST[item['category-name']];
            //快表有url
            if (father_item['solution-url']) {
                titleStr = 'API ' +
                    item['category-name'] + '.*' + ' 变更,解决方案请查看 ' + this._filterUrl(father_item['solution-url']);
                isAPIadd = true;
            }
            else {
                //快表无url查看快表的source属性
                if ('solved_name_change.json' == father_item['source']) {
                    titleStr = 'API ' + item['category-name'] + '.*' + ' 名称变更,尝试用\'$\'代替\'_\'';
                    isAPIadd = true;
                }
                else if ('solved_deprecated.json' == father_item['source']) {
                    titleStr = 'API ' + item['category-name'] + '.*' + ' 废弃,新版本不再提供兼容';
                    isAPIadd = true;
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
            isAPIadd = false;
        }
        this._isAPIadd = isAPIadd;
        if (titleStr != this._logContent.title) {
            this.clear();
            this._logContent.title = titleStr;
            this._logContent.isShow = is_show;
            this._logContent.isAPIadd = this._isAPIadd;
        }
    };
    AutoLogger.prototype.logRef = function (fileName, lineNum) {
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
        //this._logContent.references[fileName][this._api].isAPIshow = this._isAPIadd;
    };
    AutoLogger.prototype.clear = function () {
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
                htmlRefLine = '<i>' + file.getRelativePath(this._dir, file_path) + '</i>     ';
                for (var api in this._logContent.references[file_path]) {
                    this._logContent.references[file_path][api].forEach(function (lineNum) {
                        //行号需要＋1
                        fileRefLine += (lineNum + 1) + ', ';
                        htmlRefLine += '  <b>' + (lineNum + 1) + '</b> ' + ', ';
                        _this._total++;
                    });
                    fileRefLine = fileRefLine.slice(0, fileRefLine.lastIndexOf(', ')) + '行处引用 ';
                    htmlRefLine = htmlRefLine.slice(0, htmlRefLine.lastIndexOf(', ')) + '行处引用 ';
                    if (this._logContent.isAPIadd) {
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
        this._logContent.isAPIadd = false;
        this._logContent.isShow = true;
        delete this._logContent.references;
        //this._api = '';
        //this.isShow = true;
    };
    AutoLogger.prototype._filterUrl = function (key) {
        if (key in this._solutionMap) {
            return '<a href="' + this._solutionMap[key] + '">' + this._solutionMap[key] + '</a>';
        }
        else
            return key;
    };
    return AutoLogger;
})();
var APITestAction = (function () {
    function APITestAction() {
    }
    APITestAction.prototype.execute = function (projectPath, callBack) {
        var _this = this;
        if (!projectPath) {
            projectPath = egret.args.projectDir;
        }
        var egretRoot = egret.root;
        var libPath = file.joinPath(egretRoot, 'tools/commands/upgrade/2.4.2/libs'); //用自带的旧api检测
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
            //初始化 日志类
            var logger = AutoLogger.getInstance();
            logger.init(projectPath);
            if ('quickLST' in searchLST) {
                for (var p in searchLST.quickLST) {
                    var item = searchLST.quickLST[p];
                    logger.acceptCategory(item);
                }
            }
            searchLST.forEach(function (item) {
                var searchName = item['name'];
                var fatherName = item['category-name'];
                if (searchName == 'identity' && fatherName == 'Matrix') {
                    var a; //检测点
                }
                var pkg;
                //过滤＊
                if (searchName == '*') {
                    logger.acceptCategory(item);
                }
                else {
                    logger.logTitle(item);
                    //console.log(item.name+'.'+item['category-name']);
                    if (pkg = _this.tsp.getDeclarationPosition(fatherName, searchName)) {
                        _this.tsp.getAllReferenceAccordingDeclarationPosition(pkg.path, pkg.position, fatherName, item['decorate'], function (filePath, line) {
                            if (filePath) {
                                if (searchName == 'identity' && fatherName == 'Matrix') {
                                    var a; //检测点
                                }
                                logger.logRef(filePath, line);
                            }
                            else {
                                console.log(item['category-name'] + '.' + item['name'] + ' 0引用');
                            }
                        });
                    }
                }
            });
            logger.close();
            if (callBack) {
                callBack(false, logger.total, logger);
            }
        }
        else {
            if (callBack) {
                callBack(true, 1705);
            }
        }
        return 0;
    };
    return APITestAction;
})();
module.exports = APITestAction;

//# sourceMappingURL=../actions/APITest.js.map