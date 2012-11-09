/**
 * Your extension for Cloud9 IDE.
 * 
 * This extension demonstrates the ability to communicate with a server-side
 * extension.
 */
define(function(require, exports, module) {

var ext = require("core/ext");
var ide = require("core/ide");
var util = require("core/util");
var c9console = require("ext/console/console");
var menus = require("ext/menus/menus");
var commands = require("ext/commands/commands");
var GitLogParser = require("./gitlogparser.js");
var markup = require("text!./gitlog.xml");

module.exports = ext.register("ext/gitlog/gitlog", {
    name     : "gitlog",
    dev      : "You",
    alone    : true,
    deps     : [],
    type     : ext.GENERAL,
    markup   : markup,

    nodes : [],

    init : function(){
        var _self = this;
        this.nodes.push(
            menus.addItemByPath("Tools/Git/Sheep", new apf.item({
                onclick : function(){
                    winGitLog.show();
                    _self.getGitLog();
                },
                isAvailable : function(editor){
                    return ide.onLine;
                }
            }), 5400)
        );
        
        this.$onMessage = this.onMessage.bind(this);
        ide.addEventListener("socketMessage", this.$onMessage);
        
        this.gitLogParser = new GitLogParser();
    },
    
    getGitLog : function(){
        mdlGitLog.load("<logs />");

        var cmd = "git";

        var data = {
            command: cmd,
            argv: ["git", "log", "--format=raw"],
            extra: { type: "gitlog" },
            requireshandling: !commands.commands.git,
            cwd : c9console.getCwd()
        };
        // @todo should we change server side plugin to not require this?
        data.line = data.argv.join(" ");
        
        ide.dispatchEvent("track_action", {type: "gitlog", cmd: cmd});
        if (ext.execCommand(cmd, data) !== false) {
            if (ide.dispatchEvent("consolecommand." + cmd, {data: data}) !== false) {
                ide.send(data);
            }
        }
    },
    
    onMessage : function(e){
        var message = e.message;

        if (!message.extra || message.extra.type != "gitlog")
            return false;

        var type = message.type.substr(-5);
        if (type == "-exit") {
            message.code && util.alert(
                "Error", "There was an error returned from the server:",
                message.data
            );
            return;
        }

        // Is the body coming in piecemeal? Process after this message
        if (type != "-data" || !message.data)
            return;

        this.gitLogParser.parseLog(message.data);

        // Get the results of the parsing
        var parseResult = this.gitLogParser.getLogData();
        for (var i = 0, len = parseResult.length; i < len; i++) {
            mdlGitLog.appendXml(apf.n("<log/>")
                .attr("hash", parseResult[i].commit.substr(0, 9))
                .attr("author", parseResult[i].committer.fullName)
                .attr("date", parseResult[i].committer.timestamp)
                .attr("message", parseResult[i].message.join(" ")).node());
        }
    },

    enable : function(){
        this.nodes.each(function(item){
            item.enable();
        });
    },

    disable : function(){
        this.nodes.each(function(item){
            item.disable();
        });
    },

    destroy : function(){
        menus.remove("Tools/Git/Log");
        ide.removeEventListener("socketMessage", this.$onMessage);
        this.nodes.each(function(item){
            item.destroy(true, true);
        });
        this.nodes = [];
    }
});

});