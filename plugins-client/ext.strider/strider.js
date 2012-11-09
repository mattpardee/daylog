/**
 * Your extension for Cloud9 IDE!
 * 
 * Loads an iFrame inside a file tab
 */
define(function(require, exports, module) {

var ext = require("core/ext");
var editors = require("ext/editors/editors");
var menus = require("ext/menus/menus");
var markup = require("text!./strider.xml");

module.exports = ext.register("ext/strider/strider", {
    name           : "strider",
    dev            : "You",
    alone          : true,
    type           : ext.EDITOR,
    deps           : [editors],
    markup         : markup,
    iFrameUrl      : "https://striderapp.com/",
    fileExtensions : ["#!uniqueextensionstrider"],
    counter        : 0,

    nodes : [],

    init : function(){
        this.iFrameContainer = window["barIframestrider"].firstChild.$ext;

        var editor = window["barIframestrider"];
        editor.show();
        this.barIframe = this.amlEditor = editor;
    },
    
    createNewFileiFrame : function(){
        editors.gotoDocument({
            path: "iFrame" + ++this.counter + "." + this.fileExtensions[0],
            type: "nofile"
        });
    },
    
    setDocument : function(doc){
        doc.session = doc.getNode().getAttribute("path");
        this.barIframe.setProperty("value", apf.escapeXML(doc.session));
        if (!doc.isInited) {
            this.iFrameContainer.setAttribute("src", this.iFrameUrl);
            doc.isInited = true;
            doc.dispatchEvent("init");
        }
    },
    
    focus : function(){
        this.barIframe.focus();
        var page = tabEditors.getPage();
        if (!page) return;

        //var doc = page.$doc;
    },

    hook : function(){
        var _self = this;
        this.nodes.push(
            menus.addItemByPath("Tools/strider", new apf.item({
                onclick : function(){
                    _self.createNewFileiFrame();
                },
                isAvailable : function(editor){
                    return true;
                }
            }), 5400)
        );
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
        this.nodes.each(function(item){
            item.destroy(true, true);
        });
        this.nodes = [];
    }
});

});