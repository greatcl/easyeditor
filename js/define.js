var EditorTab = (function(){
	var EditorTab = function(tabId, fileInfo, tabPanel){
		this.parentPanel = tabPanel;
		this.tabId = 'tab_' + tabId;
		this.fileInfo = fileInfo;
		this.editorSession = null;
	};

	EditorTab.prototype.init = function(){
		var self = this;
		var tab = $('<div class="editor-tab editor-tab-normal editor-tab-current" id="' + this.tabId + '"><div class="tabFileName" title="' + this.fileInfo['fileName'] + '">' + this.fileInfo['fileName'] + '</div></div>');
		var closeBtn = $('<div class="tabCloseBtn tabCloseBtnDefault" title="close file">x</div>');
		closeBtn.on('click',function(){
			self.closeTab();
		});
		tab.append(closeBtn);
		tab.on('click', function(){
			self.parentPanel.switchTab(self.tabId);
		});
		tab.on('dblclick', function(){
			self.forceCloseTab();
		});
		return tab;
	};

	EditorTab.prototype.setDefaultCloseBtn = function(){
		var closeBtn = $('#'+this.tabId).find('.tabCloseBtn');
		if (closeBtn.hasClass('tabCloseBtnWarn')){
			closeBtn.removeClass('tabCloseBtnWarn').addClass('tabCloseBtnDefault');
		}
	};

	EditorTab.prototype.setWarnCloseBtn = function(){
		var closeBtn = $('#'+this.tabId).find('.tabCloseBtn');
		if (closeBtn.hasClass('tabCloseBtnDefault')){
			closeBtn.removeClass('tabCloseBtnDefault').addClass('tabCloseBtnWarn');
		}
	};

	EditorTab.prototype.closeTab = function(){
		if (this.parentPanel.aceEditor.isTextChanged(this.tabId)){
			alert('文件未保存');
		} else {
			$('#' + this.tabId).remove();
			var newTabId = this.parentPanel.removeFromTabList(this.tabId);
			if (!newTabId){ // there is no opened file
				this.parentPanel.aceEditor.clearEditorFile();
			} else {
				this.parentPanel.switchTab(newTabId);
			}
		}
	};

	EditorTab.prototype.forceCloseTab = function(){
		$('#' + this.tabId).remove();
		var newTabId = this.parentPanel.removeFromTabList(this.tabId);
		if (!newTabId){ // there is no opened file
			this.parentPanel.aceEditor.clearEditorFile();
		} else {
			this.parentPanel.switchTab(newTabId);
		}
	};

	EditorTab.prototype.bindEditorSession = function(editorSession){
		this.editorSession = editorSession;
	};

	EditorTab.prototype.isBindEditorSession = function(){
		if (!this.editorSession){
			return false;
		} else {
			return this.editorSession;
		}
	};

	return EditorTab;
})();

var TabPanel = (function(){
	var TabPanel = function(divId){
		this.divId = divId;
		this.tabPanel = $('#' + divId);
		// if cookie is set, get from cookie, or init to 0
		this.tabId = 0;
		this.fileList = [];
	};

	TabPanel.prototype.init = function(aceEditor){
		this.aceEditor = aceEditor;
	};

	TabPanel.prototype.addTab = function(fileInfo){
		var thisTabId = 'tab_' + this.tabId;
		$('.editor-tab-current').removeClass('editor-tab-current').addClass('editor-tab-normal');
		var editorTab = new EditorTab(this.tabId, fileInfo, this);

		var tabFile = {'filePath': fileInfo['filePath'], 'tabId' : thisTabId, 'editorTab': editorTab};
		this.tabPanel.append(editorTab.init());
		this.fileList.push(tabFile);
		this.tabId += 1;
		return thisTabId;
	};

	TabPanel.prototype.bindTabEditorSession = function(tabId, editorSession){
		for(var i in this.fileList){
			if (this.fileList[i]['tabId'] == tabId){
				this.fileList[i]['editorTab'].bindEditorSession(editorSession);
				break;
			}
		}
	};

	TabPanel.prototype.isBindEditorSession = function(tabId){
		for(var i in this.fileList){
			if (this.fileList[i]['tabId'] == tabId){
				return this.fileList[i]['editorTab'].isBindEditorSession();
			}
		}
	};

	TabPanel.prototype.setTabCloseBtn = function(tabId, btnClass){
		for(var i in this.fileList){
			if (this.fileList[i]['tabId'] == tabId){
				if (btnClass == 'default'){
					return this.fileList[i]['editorTab'].setDefaultCloseBtn();
				} else if (btnClass == 'warn'){
					return this.fileList[i]['editorTab'].setWarnCloseBtn();
				}
				
			}
		}
	};

	TabPanel.prototype.isTabExist = function(filePath){
		for(var i in this.fileList){
			if (this.fileList[i]['filePath'] == filePath){
				return this.fileList[i]['tabId'];
			}
		}
		return false;
	};

	TabPanel.prototype.switchTab = function(tabId){
		$('.editor-tab-current').removeClass('editor-tab-current').addClass('editor-tab-normal');
		$('#' + tabId).addClass('editor-tab-current');
		// load file content
		this.aceEditor.loadFileContent(tabId);
	};

	TabPanel.prototype.removeFromTabList = function(tabId){
		for(var i in this.fileList){
			if (this.fileList[i]['tabId'] == tabId){
				this.fileList.splice(i, 1);
				break;
			}
		}
		
		// delete file cache
		this.aceEditor.removeFileCache(tabId);
		
		// there is no opened file
		if (this.fileList.length == 0){
			return false;
		}

		// the file that be closed is the last file in the opened file list
		if (i == this.fileList.length){
			--i;
		}
		return this.fileList[i]['tabId'];
	};

	return TabPanel;
})();

var EditorPage = (function(){
	var EditorPage = function(){
	};

	EditorPage.prototype.init = function(){
		this.autoSize();
		this.bindEvent();
	};

	EditorPage.prototype.autoSize = function(){
		// height
		var win_h = $(window).height();
    	var filelist_pos = $('#filelist').position();
    	var h = win_h - filelist_pos.top;
    	$('#treecontainer').height(h - $('.treeinfo').height() - 1);

    	// width
    	var win_w = $(window).width();
    	var left_w = $('div.left').width();
    	var w = win_w - left_w - 1;
    	// $('div.right').width(w);
    	// $('div.top-panel').width(w-1);
	};

	EditorPage.prototype.bindEvent = function(){
		var self = this;
		$(window).resize(function(){
			self.autoSize();
		});
	};

	return EditorPage;
})();

var ACEEditor = (function(){
	var ACEEditor = function(editorId){
		this.editorId = editorId;
		this.editor = ace.edit(editorId);
		ace.require('ace/ext/settings_menu').init(editor);
		this.modeList = ace.require('ace/ext/modelist');
	};

	ACEEditor.prototype.init = function(tabPanel){
		this.tabPanel = tabPanel;
		var self = this;
		this.editor.setReadOnly(true);
	    this.editor.commands.addCommands([{
	    	name : 'Save',
	    	bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
	    	exec: function(editor){
	    		self.saveFile();
	    	},
	    	readOnly: false
	    },
	    {
			name: "showSettingsMenu",
			bindKey: {win: "Ctrl-q", mac: "Command-q"},
			exec: function(editor) {
				editor.showSettingsMenu();
			},
			readOnly: true
		},
		{
		    name: "setVimMode",
		    bindKey: {win: 'Ctrl-Alt-v', mac: "Command-Alt-v"},
		    exec: function(editor){
		        var handler = editor.getKeyboardHandler();
		        if (handler.platform == 'vim'){
		            handler = '';
		        } else if (handler.platform == 'win'){
		            handler = 'ace/keyboard/vim';
		        } else {
		            handler = '';
		        }
		        editor.setKeyboardHandler(handler);
		    },
		    readOnly: true
		}]);
	    this.setFontSize('16px');
		this.setTheme();

		this.editor.on('change',function(){
			self.setTabCloseBtn();
		});
	};

	ACEEditor.prototype.setTabCloseBtn = function(){
		if (this.isTextChanged()){
			this.tabPanel.setTabCloseBtn(this.currentTabId, 'warn');
		} else {
			this.tabPanel.setTabCloseBtn(this.currentTabId, 'default');
		}
	};

	ACEEditor.prototype.isTextChanged = function(tabId){
		tabId = tabId ? tabId : this.currentTabId;
		var editorSession = this.tabPanel.isBindEditorSession(tabId);
		var cacheFileContent = $('[tabId="' + tabId + '"]').val();
		var editorFileContent = editorSession.getValue();
		return !(cacheFileContent == editorFileContent);
	};

	ACEEditor.prototype.saveFile = function(){
		var self = this;
		this.updateCacheFile(this.tabId, this.editor.getValue());
		$.post('./index.php?c=main&a=saveFile',{
			'filePath' : this.filePath,
			'fileContent' : this.editor.getValue()
		}, function(result){
			result = eval( "(" + result + ")");
			alert(result.errmsg);
			if (result.errno == 0){
				self.setTabCloseBtn();
			}
		});
	};

	ACEEditor.prototype.setTheme = function(themeName){
		if (!themeName){
			// get theme from cookie
			themeName = '';
			if (!themeName){
				themeName = 'ace/theme/monokai';
			}
			this.setTheme(themeName);
		}
		this.editor.setTheme(themeName);
		// @todo set current theme to cookie
	};

	ACEEditor.prototype.setFontSize = function(fontSize){
		if (!fontSize){
			fontSize = '12px';
		}
		document.getElementById(this.editorId).style.fontSize=fontSize;
	};

	ACEEditor.prototype.openFile = function(filePath){
		var self = this;
		var tabId = this.tabPanel.isTabExist(filePath);
		if (!tabId){
			var fileInfo = {'fileName' : filePath.split('/').pop(), 'filePath' : filePath};
			tabId = this.tabPanel.addTab(fileInfo);
			$.getJSON('./index.php?c=main&a=getFile',{
				'filepath' : filePath
			}, function(result){
				var fileDiv = '<textarea tabId="' + tabId + '" filePath="' + filePath + '"></textarea>';
				$('#fileCache').append(fileDiv);
				$('[tabId="' + tabId + '"]').val(result['res']['content']);
				self.loadFileContent(tabId);
			});
		} else {
			this.tabPanel.switchTab(tabId);
		}

		this.filePath = filePath;
		this.tabId = tabId;
	};

	ACEEditor.prototype.loadFileContent = function(tabId){
		// current active tab Id
		this.currentTabId = tabId;

		var fileContent = $('[tabId="' + tabId + '"]').val();
		var filePath = $('[tabId="' + tabId + '"]').attr('filePath');
		var aceMode = this.modeList.getModeForPath(filePath).mode;
		var editorSession = this.tabPanel.isBindEditorSession(tabId);
		if (!editorSession){
			editorSession = ace.createEditSession(fileContent, aceMode);
			this.tabPanel.bindTabEditorSession(tabId, editorSession);
		}
		this.editor.setSession(editorSession);
		this.editor.setReadOnly(false);
		this.editor.focus();
	};

	ACEEditor.prototype.updateCacheFile = function(tabId, fileContent){
		$('[tabId="' + tabId + '"]').val(fileContent);
	};

	ACEEditor.prototype.removeFileCache = function(tabId){
		$('[tabId="' + tabId + '"]').remove();
	};

	ACEEditor.prototype.clearEditorFile = function(){
		this.editor.setReadOnly(true);
		this.editor.setSession(ace.createEditSession('', 'ace/mode/text'));
		this.editor.focus();
	};

	return ACEEditor;
})();

var FileTree = (function(){
	var FileTree = function(treeId){
		this.treeId = treeId;
		this.fileTree = $('#'+treeId);
		this.currentPath = '/';
	};

	FileTree.prototype.init = function(aceEditor, tabPanel){
		this.aceEditor = aceEditor;
		this.tabPanel = tabPanel;
		this.getDirList(this.currentPath);
		var self = this;
		$('.pathBtn').on('click', function(){
			self.getDirList($(this).attr('path'));
		});
	};

	FileTree.prototype.buildTree = function(fileList){
		var treeshow = '';
		for (var file in fileList){
			var isdir = fileList[file].isdir,
			    read = fileList[file].readable,
			    write = fileList[file].writable,
			    fileName = fileList[file].filename,
				path = fileList[file].path;
			if (fileName){
				if (isdir){
					if (!(this.currentPath == '/' && fileName == '..')){
						treeshow += '<li title="' + (fileName == '..' ? '上一级' : fileName) + '" class="dir" type="dir">'
							 + '<div write=' + write + ' read = ' + read + ' path = "' + path + '" filename = "' + fileName + '">'
							 + '' + fileName 
							 + '</div></li>';
					}
				} else {
					treeshow += '<li title="' + fileName + '" class="file" type="file">'
							 + '<div write=' + write + ' read = ' + read + ' path = "' + path + '" filename = "' + fileName + '">'
							 + '' + fileName 
							 + '</div></li>';
				}
			}
		}

		$('#currentPath').html(this.currentPath);
		$('#currentPath').attr('title', this.currentPath);

		var pathArray = this.currentPath.split('/');
		var lastPath = pathArray.pop();
		if (lastPath === ''){
			$('#lastPath').hide();
		} else {
			$('#lastPath').show();
			$('#lastPath').attr('path', this.currentPath);
			$('#lastPath').attr('title', this.currentPath);
			$('#lastPath').html(lastPath);
		}
		
		var lastLevelPath = pathArray.join('/');
		var lboPath = pathArray.pop();
		$('#lboPath').attr('path', lastLevelPath === '' ? '/' : lastLevelPath);
		$('#lboPath').attr('title', lastLevelPath === '' ? '/' : lastLevelPath);
		$('#lboPath').html(lboPath === '' ? '/' : lboPath);
		this.fileTree.html(treeshow);
	};

	FileTree.prototype.getDirList = function(dirPath){
		var self = this;
		$.getJSON('./index.php?c=main&a=getFileList',{
			'dirpath' : dirPath
		},function(result){
			self.currentPath = result.path;
			self.buildTree(result['fileList']);

			self.bindEvent();
		});
	};

	FileTree.prototype.bindEvent = function(){
		var self = this;
		$('#filetree li').each(function(){
			$(this).on('click', function(event){
				$('li.selected').removeClass('selected');
				$(this).addClass('selected');
			});

			$(this).on('dblclick', function(){
				var filetype = $(this).attr('type');
				var fileName = $(this).find('div').attr('filename');
				var filePath = $(this).find('div').attr('path');
				var thispath = (self.currentPath == '/' ? '/' : self.currentPath + '/') + $(this).find('div').html();
				if(filetype == 'dir'){
					self.getDirList(thispath);
				} else if(filetype == 'file'){
					self.aceEditor.openFile(thispath);
				}
			});
		});
	};

	return FileTree;
})();