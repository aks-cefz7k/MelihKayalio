if($ == undefined){
	$ = jQuery;
}
function reloadDatasetTree(){
	$("#datasettreediv ul").remove();
	$("#datasettreediv").append("<ul id=\"datasettree\"></ul>");
	if(pageInfo.selectDs == null || pageInfo.selectDs == "null"){
		$('#datasettree').tree({
			dnd:false,
			data:[{"id":"err","text":"数据还未创建立方体。", "iconCls":"icon-no"}]
		});
		return
	}else if(pageInfo.selectDs == ''){
		$('#datasettree').tree({
			dnd:false,
			data:[{"id":"err","text":"还未选择数据。", "iconCls":"icon-no"}]
		});
		return
	}else{
		$('#datasettree').tree({
			url:'../portal/PortalIndex!cubeTree().action?selectDsIds=' + pageInfo.selectDs,
			dnd:true,
			lines:false,
			onBeforeDrag:function(target){
				if(!target.attributes || target.attributes.tp == 'root'){
					return false;
				}
				return true;
			},
			onDragEnter:function(target, source){
				return false;
			}
		});
	}
}

function newpage(){
	var url = 'ReportDesign.action?menus='+curTmpInfo.menus+'&showtit='+showtit;
	if(curTmpInfo.isupdate == true){
		if(confirm('页面还未保存\n是否保存当前页面？')){
			savepage(function(){
				location.href = url;
			});
		}else{
			location.href = url;
		}
	}else{
		location.href = url;
	}
}
function initparam(){
	//回写参数值
	if(pageInfo.params && pageInfo.params.length>0){
		$("#p_param div.ptabhelpr").remove();
		$("#p_param").append("<b>参数： </b>");
		for(i=0; i<pageInfo.params.length; i++){
			var obj = $("#p_param");
			var str = "<span class=\"pppp\" id=\"pa_"+pageInfo.params[i].id+"\"><span title=\"筛选\" onclick=\"paramFilter('"+pageInfo.params[i].id+"', '"+pageInfo.params[i].type+"', '"+pageInfo.params[i].name+"')\" class=\"text\">"+pageInfo.params[i].name+"(";
			if(pageInfo.params[i].type == 'frd' || pageInfo.params[i].type == 'year' || pageInfo.params[i].type == 'quarter'){
				str = str  + (!pageInfo.params[i].valStrs || pageInfo.params[i].valStrs == ''?"无":pageInfo.params[i].valStrs);
			}else {
				str = str + pageInfo.params[i].st + " 至 " + pageInfo.params[i].end;
			}
			str = str + ")</span><button title=\"删除\" class=\"btn btn-default btn-xs\" onclick=\"deleteParam('"+pageInfo.params[i].id+"')\"><i class=\"fa fa-remove\"></i></button></span>";
			obj.append(str);
		}
	}
	//注册接收维度拖拽事件
	$("#p_param").droppable({
		accept:"#datasettree .tree-node",
		onDragEnter:function(e,source){
			var node = $("#datasettree").tree("getNode", source);
			var tp = node.attributes.col_type;
			//对维度拖拽设置图标
			if(tp == 1 ){
				$(source).draggable('proxy').find("span").removeClass("tree-dnd-no");
				$(source).draggable('proxy').find("span").addClass("tree-dnd-yes");
				$(this).css("border", "1px solid #ff0000");
			}
			e.cancelBubble=true;
			e.stopPropagation(); //阻止事件冒泡
		},
		onDragLeave:function(e,source){
			$(source).draggable('proxy').find("span").addClass("tree-dnd-no");
			$(source).draggable('proxy').find("span").removeClass("tree-dnd-yes");
			$(this).css("border", "1px solid #d3d3d3");
			e.cancelBubble=true;
			e.stopPropagation(); //阻止事件冒泡
		},
		onDrop:function(e,source){
			e.cancelBubble=true;
			e.stopPropagation(); //阻止事件冒泡
			$(this).css("border", "1px solid #d3d3d3");
			var node = $("#datasettree").tree("getNode", source);
			var tp = node.attributes.col_type;
			if(tp == 1){
				if(!pageInfo.params){
					pageInfo.params = [];
				}
				//判断是否存在
				if(findParamById(node.attributes.col_id) != null){
					msginfo("您已经添加了该参数！", "error");
					return;
				}
				var id = node.attributes.col_id;
				var p = {"id":id, "name":node.text, "type":node.attributes.dim_type, "colname":node.attributes.col_name,"alias":node.attributes.alias, "tname":node.attributes.tname,"tid":node.attributes.tid,"valType":node.attributes.valType,"tableName":node.attributes.tableName, "tableColKey":node.attributes.tableColKey,"tableColName":node.attributes.tableColName, "dimord":node.attributes.dimord, "grouptype":node.attributes.grouptype,"dateformat":(node.attributes.dateformat==null?"":node.attributes.dateformat)};
				pageInfo.params.push(p);
				var obj = $(this);
				obj.find("div.ptabhelpr").remove();
				if(obj.find("b").size() == 0){
					obj.append("<b>参数： </b>");
				}
				obj.append("<span class=\"pppp\" id=\"pa_"+id+"\"><span title=\"筛选\" onclick=\"paramFilter('"+id+"', '"+node.attributes.dim_type+"','"+node.text+"')\" class=\"text\">"+node.text+"(无)</span><button class=\"btn btn-default btn-xs\" title=\"删除\" onclick=\"deleteParam('"+id+"')\"><i class=\"fa fa-remove\"></i></button></span>");
				//弹出筛选窗口
				paramFilter(id, p.type, p.name);
			}
		}
	});
}
function paramFilter(id, type, name){
	var param = findParamById(id);
	$('#pdailog').dialog({
		title: name+' - 参数值筛选',
		width: 290,
		height: param.type == 'month' || param.type == 'day' ? 240 : 320,
		closed: false,
		cache: false,
		modal: true,
		content:'<div id="div_paramfilter"><div class="panel-loading">Loading...</div></div>',
		buttons:[{
				text:'确定',
				iconCls:'icon-ok',
				handler:function(){
					var vals = "";
					var valStrs = "";
					if(param.type == 'frd' || param.type == 'year' || param.type == 'quarter'){
						var seles = $("#pdailog input[name='dimval']:checkbox:checked");
						seles.each(function(a, b){
								if(a >= 10){  //只能最多选10个
									return;
								}
								vals = vals + $(this).val();
								if(a == seles.size() - 1 || a == 9){
									
								}else{
								   vals = vals + ',';
								}
								valStrs = valStrs + $(this).attr("desc");
								if(a == seles.size() - 1 || a == 9){
									
								}else{
								   valStrs = valStrs + ',';
								}
						});
						$("#p_param #pa_"+id+" span.text").text(name+"("+(valStrs == '' ? '无':valStrs)+")");
						param.vals = vals;
						param.valStrs = valStrs;
					}else if(param.type == 'month'){
						param.st =  $("#pdailog #dfm2").val();
						param.end =  $("#pdailog #dfm1").val();
						//判断是否st < ed
						if(Number(param.st) > Number(param.end)){
							msginfo("您选择的开始月份不能大于结束月份。", "error");
							return;
						}
						$("#p_param #pa_"+id+" span.text").text(name + "("+ param.st + " 至 " + param.end+")");
					}else if(param.type == 'day'){
						param.st =  $("#pdailog #dft2").val();
						param.end =  $("#pdailog #dft1").val();
						//判断是否st < ed
						if(Number(param.st.replace(/-/g, "")) > Number(param.end.replace(/-/g, ""))){
							msginfo("您选择的开始日期不能大于结束日期。", "error");
							return;
						}
						$("#p_param #pa_"+id+" span.text").text(name + "("+ param.st + " 至 " + param.end+")");
					}
					$('#pdailog').dialog('close');
					curTmpInfo.isupdate = true;
					flushPage();
				}
			},{
				text:'取消',
				iconCls:"icon-cancel",
				handler:function(){
					$('#pdailog').dialog('close');
				}
			}]
	});
	var url =  (curTmpInfo.filterUrl ? curTmpInfo.filterUrl :"DimFilter!paramFilter.action") + "?dimType="+param.type+"&tid="+param.tid+"&dimId="+id;
	if(param.type == "month"){
		url = url + "&dfm2="+(param.st?param.st:"")+"&dfm1="+(param.end?param.end:"");
	}else if(param.type == "day"){
		url = url + "&dft2="+(param.st?param.st:"")+"&dft1="+(param.end?param.end:"");
	}else{
		//url = url + "&vals="+(!param.vals || param.vals =='' ? '':param.vals );;
	}
	$("#pdailog #div_paramfilter").load(url, {vals:(!param.vals || param.vals =='' ? '':param.vals),t:Math.random()});
}
function searchDims2(val, id){
	var param = findParamById(id);
	var url = "DimFilter!search.action?tid="+param.tid+"&dimId="+id+"" ;
	$.ajax({
		type:"POST",
		url:url,
		data:{keyword:val, vals:(!param.vals || param.vals =='' ? '':param.vals), t:Math.random()},
		dataType:'HTML',
		success:function(resp){
			$("#pdailog .dfilter").html(resp);
		}
	});
}
function flushPage(){
	//刷新页面
	for(var k=0; pageInfo.comps&&k<pageInfo.comps.length; k++){
		var tp = pageInfo.comps[k].type;
		if(tp == 'table'){
			/**
			如果表格组件的时间维度和参数的时间维度不一致，删除计算度量
			**/
			var comp = pageInfo.comps[k];
			if(!paramsamedimdate(comp)){
				for(i=0; comp.kpiJson&&i<comp.kpiJson.length; i++){
					delete comp.kpiJson[i].compute;
				}
			}
			tableView(pageInfo.comps[k], pageInfo.comps[k].id);
		}else if(tp == 'chart'){
			chartview(pageInfo.comps[k], pageInfo.comps[k].id);
		}
	}
}
function deleteParam(id){
	$("#p_param #pa_" + id).remove();
	var idx = -1;
	for(i=0; pageInfo.params&&i<pageInfo.params.length; i++){
		var p = pageInfo.params[i];
		if(p.id == id){
			idx = i;
			break;
		}
	}
	pageInfo.params.splice(idx, 1);
	if(pageInfo.params.length == 0){
		$("#p_param").html("<div class=\"ptabhelpr\">拖拽维度到此处作为页面参数</div>");
	}
	flushPage();
}

function openreport(){
	var ctx = "<div class=\"openlistbody\"><div style=\"margin:5px 5px 5px 1px;float:left;\"><a id=\"rename\">更名</a> <a id=\"delreport\">删除</a></div><div align=\"right\" style=\"margin:5px;\"><input id=\"subSearchBox\" style=\"width:160px\"></input></div><div class=\"openlist\"></div></div>";
	$('#pdailog').dialog({
		title: '打开报表',
		width: 620,
		height: 400,
		closed: false,
		cache: false,
		modal: true,
		toolbar:null,
		content:ctx,
		onLoad:function(){},
		buttons:[{
				text:'确定',
				iconCls:'icon-ok',
				handler:function(){
					var r = $("input[name=\"reportId\"]:checked").val();
					if(!r || r == null){
						msginfo("请至少选择一个报表！", "error");
						return;
					}
					$('#pdailog').dialog('close');
					$(this).attr("href", "#");
					var url = 'ReportDesign.action?pageId='+r+'&showtit='+showtit+'&menus='+curTmpInfo.menus;
					if(curTmpInfo.isupdate == true){
						if(confirm('页面还未保存\n是否保存当前页面？')){
							savepage(function(){
								location.href = url;
							});
						}else{
							location.href = url;
						}
					}else{
						location.href = url;
					}
				}
			},{
				text:'取消',
				iconCls:"icon-cancel",
				handler:function(){
					$('#pdailog').dialog('close');
				}
			}]
	});
	$("#rename").linkbutton({'iconCls':'icon-edit', plain:true}).click(function(){
		var r = $("input[name=\"reportId\"]:checked").val();
		if(!r || r == null){
			msginfo("请至少选择一个报表！", "error");
			return;
		}
		$.messager.prompt('报表改名', '请输入新的报表名称？', function(msg){
			if(msg){
				$.ajax({
					  type: "POST",
					   url: "MyReport!rename.action",
					   dataType:"HTML",
					   data: {reportId:r, reportName:msg},
					   success: function(resp){
						   $('#pdailog .openlist').load('MyReport!list.action?t='+Math.random());
					   },
					   error:function(){
						  
					   }
				});
			}
		});
	});
	$("#delreport").linkbutton({'iconCls':'icon-remove', plain:true}).click(function(){
		var r = $("input[name=\"reportId\"]:checked").val();
		if(!r || r == null){
			msginfo("请至少选择一个报表！", "error");
			return;
		}
		if(confirm('是否确认删除？')){
			$.ajax({
				  type: "POST",
				   url: "MyReport!delete.action",
				   dataType:"HTML",
				   data: {reportId:r},
				   success: function(resp){
					   $('#pdailog .openlist').load('MyReport!list.action?t='+Math.random());
				   },
				   error:function(){
					  
				   }
			});
		}
	});
	$("#subSearchBox").searchbox({
		 searcher:function(value,name){
			$('#pdailog .openlist').load('MyReport!list.action',{"keyword":value,"t":Math.random()});
		},
		prompt:'请输入查询关键字.'
	});
	$('#pdailog .openlist').load('MyReport!list.action?t='+Math.random());
}

/**
function delComp(id){
	//从全局对象中移除
	var idx = -1;
	for(i=0;i<pageInfo.comps.length; i++){
		var t = pageInfo.comps[i];
		if(t.id == id){
			idx = i;
			break;
		}
	}
	pageInfo.comps.splice(idx, 1);
	$("#T" + id).remove();
	if(pageInfo.comps.length == 0){
		$("#optarea").append("<div class='tabhelpr'>请先添加组件再进行多维分析(点击<strong>插入</strong>按钮)。</div>");
	}
}
**/
/**
* tp = table, chart, text 3种内置类型
  name : 组件标题
  ispush:是否添加到组件视图树
  curComp:组件配置信息
  ctx:组件InnerHTML  
**/
function addComp(id, name, ctx, ispush, tp, curComp){
	if(ctx == null || ctx == undefined){
		if(tp =='table'){
			//判断是新增，还是回写已有的
			if(curComp == null || curComp == undefined){
				ctx = crtCrossTable();
			}else{
				if(curComp.tableJson == undefined || curComp.kpiJson == undefined){ //添加了组件，但未选度量
					ctx = crtCrossTable();
				}else{
					ctx = "";
				}
			}
		}else if(tp == 'chart'){
			ctx = crtChart(id);
		}
	}
	
	//是否向全局对象中添加内容
	if(ispush == true){
		pageInfo.comps.push({"id":id, "name":name, "type":tp});
		curTmpInfo.isupdate= true;
	}
	var titleHTML="<div class=\"comp_table\" tp=\""+tp+"\" id=\"T"+id+"\">" +		
			"<div class=\"ctx\">"+(ctx == null ? "" : ctx)+"</div>" +
			"</div>";
	if(tp == "table"){
		$("#optarea").html(titleHTML);
	}else if(tp == "chart"){
		$("#chartarea").html(titleHTML);
	}
	//如果是表格或图形，增加接受拖拽事件
	if(tp == 'table'){
		btns=[];
		//表格接收拖拽事件
		if(curComp != null && curComp != undefined){
			if(curComp.tableJson == undefined || curComp.kpiJson == undefined){ //添加了组件，但未选度量,需要添加拖放度量事件
				initDropDiv(id);
			}else{
				tableView(curComp, id);
			}
		}else{
			initDropDiv(id);
		}
	}
	
	if(tp == 'chart'){
		//如果是回写，更新图形数据
		if(curComp != null && curComp != undefined){
			chartview(curComp, id);
			//回写配置信息
			backChartData(curComp);
			//图形接收拖拽事件
			if(curComp.chartJson.type == 'bubble' || curComp.chartJson.type == 'scatter'){
				initChartByScatter(id);
			}else{
				initChartKpiDrop(id)
			}
		}else{
			//或者是新增
			//图形接收拖拽事件
			if(curTmpInfo.charttype == 'bubble' || curTmpInfo.charttype == 'scatter'){
				initChartByScatter(id);
			}else{
				initChartKpiDrop(id)
			}
		}
	}
}
function selectdataset(){
	$('#pdailog').dialog({
		title: '选择数据模型 ',
		width: 620,
		height: 400,
		closed: false,
		cache: false,
		modal: true,
		toolbar:null,
		content:"<div align=\"right\" style=\"margin:5px;\"><input id=\"subSearchBox\" style=\"width:160px\"></input></div><table id=\"subjectlist\" title=\"\" style=\"width:610px;height:300px;\" ><thead><tr><th data-options=\"field:'ck',checkbox:true\"><th data-options=\"field:'name',width:160\">名称</th><th data-options=\"field:'fl',width:100\">分类</th><th data-options=\"field:'note',width:300\">说明</th></tr></thead></table>",
		buttons:[{
					text:'确定',
					iconCls:'icon-ok',
					handler:function(){
						 var row = $("#subjectlist").datagrid("getChecked");
						 if(row == null || row.length == 0){
							msginfo("请勾选数据。", "error");
							return;
						  }
						pageInfo.selectDs = row[0].tid;
						$('#pdailog').dialog('close');
						//更新页面为已修改
						curTmpInfo.isupdate = true;
						//更新数据集
						reloadDatasetTree();
					}
				},{
					text:'取消',
					iconCls:"icon-cancel",
					handler:function(){
						$('#pdailog').dialog('close');
					}
				}]
	});
	$("#subSearchBox").searchbox({
		 searcher:function(value,name){
			$("#subjectlist").datagrid("load",{"id":"0", key:value,t:Math.random()});
		},
		prompt:'请输入查询关键字.'
	});
	$("#subjectlist").datagrid({
		singleSelect:true,
		collapsible:false,
		pagination:true,
		pageSize:20,
		border:true,
		url:'DataSet!listSubject.action',
		method:'post',
		queryParams:{id:"0", t: Math.random()}
	});
}
/**
保存页面
@param  {Function} 保存完成后回调函数
*/
function savepage(cb){
	for(k=0; k<pageInfo.comps.length; k++){
		var cmp=pageInfo.comps[k];
		var tp = cmp.type,id=cmp.id;
	}
	var jsonStr = JSON.stringify(pageInfo);
	var pageId = pageInfo.id;
	if(pageId == undefined || pageId == null){
		pageId = "";
	}
	if(pageId == ''){ //未保存过，提示用户输入名称
		var ctx = "<div style=\"margin:10px 20px 5px 20px;\"><br/><span style=\"display:inline-block;width:60px;\"> 报表名称： </span><input type=\"text\" style=\"width:187px;\" id=\"pageName\"></div>";
		$('#pdailog').dialog({
		title: '保存报表',
		width: 330,
		height: 160,
		closed: false,
		cache: false,
		modal: true,
		toolbar:null,
		content: ctx,
		buttons:[{
				text:'确定',
				iconCls:'icon-ok',
				handler:function(){
					var name = $("#pdailog #pageName").val();
					if(name == ''){
						msginfo("您还未录入文件名称。", "error");
						$("#pdailog #pageName").focus();
						return;
					}
					$.post("ReportDesign!save.action", {"pageInfo": jsonStr, "pageId":"", "pageName" : name}, function(resp){
						if(resp == 'no'){
							msginfo("保存失败，名称存在重复。", "error");
							return;
						}
						pageInfo.id = Number(resp);
						if(cb != undefined){
							cb();
						}else{
							
						}
						msginfo("保存成功！", "success");
						//更新页面为未修改
						curTmpInfo.isupdate = false;
						$('#pdailog').dialog('close');
					});
				}
			},{
				text:'取消',
				iconCls:"icon-cancel",
				handler:function(){
					$('#pdailog').dialog('close');
				}
			}]
		});
	}else{ //已经保存过，直接update
		$.post("ReportDesign!save.action", {"pageInfo": jsonStr, "pageId":pageId}, function(resp){
			pageInfo.id = Number(resp);
			if(cb != undefined){
				cb();
			}else{
			}
			msginfo("保存成功！", "success");
			//更新页面为未修改
			curTmpInfo.isupdate = false;
		});
	}
}
//tp表示是提示信息还是错误信息
function releasePage(){
	if(pageInfo.comps.length == 0){
		msginfo("发布失败，页面无任何内容！", "error");
		return;
	}
	$('#pdailog').dialog({
		title: '报表发布',
		width: 612,
		height: 420,
		closed: false,
		cache: false,
		modal: true,
		toolbar:null,
		content:"<div style=\"margin:5px 5px 5px 1px;\"><span class=\"inputtext\">报表目录：</span><input id=\"reportcatalist\" style=\"width:200px;\"></div><div style=\"border-bottom:solid 1px #CCCCCC;border-top:solid 1px #CCCCCC;\"><table id=\"reportlist\" title=\"\" style=\"width:600px;height:270px;\"><thead><tr><th data-options=\"field:'ck',checkbox:true\"><th data-options=\"field:'name',width:320\">名称</th><th data-options=\"field:'crtdate',width:100\">创建时间</th><th data-options=\"field:'loginName',width:100\">创建人</th></tr></thead></table></div><div style=\"margin:5px;\"><span class=\"inputtext\">报表名称：</span><input type=\"text\" style=\"width:187px\" name=\"rname\" id=\"rname\"> &nbsp; &nbsp; &nbsp; <span class=\"inputtext\">报表类型：</span><select id=\"rtype\" name=\"rtype\" style=\"width:187px\"><option value=\"gd\">固定报表</optin><option value=\"olap\">OLAP报表</optin></select></div>",
		onLoad:function(){},
		buttons:[{
				text:'确定',
				handler:function(){
					var cata = $("#pdailog #reportcatalist").combotree("tree").tree("getSelected");
					if(cata == null || cata.id == '0'){
						msginfo("您还未选择报表发布目录。", "error");
						return;
					}
					var name = $("#pdailog #rname").val();
					if(name == ''){
						msginfo("请输入报表名称！", "error");
						$("#pdailog #rname").focus();
						return;
					}
					
					var rtype = $("#pdailog #rtype").val();
					//给表格组件添加kpiOther
					for(i=0; rtype=="gd"&&i<pageInfo.comps.length; i++){
						if(pageInfo.comps[i].type != 'text' && pageInfo.comps[i].kpiJson == undefined){
							msginfo("组件中无数据，请先拖放度量或维度。", "error");
							$('#pdailog').dialog('close');
							return;
						}
						if(pageInfo.comps[i].type == 'table'){
							pageInfo.comps[i].tableJson.cols.push({"type":"kpiOther","id":"kpi"});
						}
					}
					var json =  JSON.stringify(pageInfo);
					//移除kpiOther
					for(i=0; rtype=="gd"&&i<pageInfo.comps.length; i++){
						if(pageInfo.comps[i].type == 'table'){
							pageInfo.comps[i].tableJson.cols.pop();
						}
					}
					
					$.ajax({
					   type: "POST",
					   url: "ReportDesign!release.action",
					   dataType:"json",
					   data: {"pageName": name, "cataId":cata.id, "pageInfo": json, "rtype":rtype},
					   async:false,
					   success: function(resp){
						  msginfo("报表发布成功。", "success");
						   //更新为当前目录
						  pageInfo.releCata = cata.id;
						  curTmpInfo.isupdate = true;
						  $('#pdailog').dialog('close');
					   },
					   error:function(){
						   msginfo("覆盖操作不能修改报表类型。", "error");
					   }
					});
				}
			},{
				text:'取消',
				handler:function(){
					$('#pdailog').dialog('close');
				}
			}]
	});
	//加载路径树
	$("#pdailog #reportcatalist").combotree({
		url:"../report/ReportCatalog!tree.action?type=-1",
		onClick: function(node){
			$("#reportlist").datagrid("load",{"cataId":node.id,t:Math.random()});
		}
	});
	//设置默认值
	if(pageInfo.releCata){
		$("#pdailog #reportcatalist").combotree("setValues",[pageInfo.releCata]);
	}
	//加载报表列表
	$("#pdailog #reportlist").datagrid({
		singleSelect:true,
		collapsible:false,
		border:false,
		url:'../report/Report!listRelease.action',
		method:'post',
		queryParams:{cataId:pageInfo.releCata?pageInfo.releCata:"-1", t: Math.random()},
		onSelect:function(index, data){
			$("#pdailog #rname").val(data.name);
			if(data.rfile == null){
				$("#pdailog #rtype").val("olap");
			}else{
				$("#pdailog #rtype").val("gd");
			}
		}
	});
}
//打印某个组件
function printComp(compId){
	var comp = findCompById(compId);
	if(comp.type == "table"){
		comp.tableJson.cols.push({"type":"kpiOther","id":"kpi"});
	}
	var json = {comps:[comp], params :[]};
	var url2 = "about:blank";
	var name = "printwindow";
	window.open(url2, name);
	var ctx = "<form name='prtff' method='post' target='printwindow' action=\""+(curTmpInfo.prtUrl?curTmpInfo.prtUrl:"ReportDesign!print.action")+"\" id='expff'><input type='hidden' name='pageInfo' id='pageInfo' value='"+JSON.stringify(json)+"'></form>";
	if(comp.type == "table"){
		comp.tableJson.cols.pop();
	}
	$(ctx).appendTo("body").submit().remove();
}
//打印页面
function printData(){
	for(i=0; i<pageInfo.comps.length; i++){
		if(pageInfo.comps[i].type != 'text' && (!pageInfo.comps[i].kpiJson || pageInfo.comps[i].kpiJson.length == 0)){
			msginfo("表或图中还未添加数据","error");
			return;
		}
		if(pageInfo.comps[i].type == 'table'){
			pageInfo.comps[i].tableJson.cols.push({"type":"kpiOther","id":"kpi"});
		}
	}
	var json =  JSON.stringify(pageInfo);
	//移除kpiOther
	for(i=0; i<pageInfo.comps.length; i++){
		if(pageInfo.comps[i].type == 'table'){
			pageInfo.comps[i].tableJson.cols.pop();
		}
	}
	var url2 = "about:blank";
	var name = "printwindow";
	window.open(url2, name);
	var ctx = "<form name='prtff' method='post' target='printwindow' action=\"ReportDesign!print.action\" id='expff'><input type='hidden' name='pageInfo' id='ppageInfo'></form>";
	var o = $(ctx).appendTo("body");
	$("#ppageInfo").val(json);
	o.submit().remove();
}
//推送页面
/**
function pushData(){
	var ctx = "<div style=\"margin:5px 5px 5px 25px; line-height:26px;\">推 送 到： <br/><select id=\"pushType\" name=\"pushType\" style=\"width:210px;\"><option value=\"\"></option><option value=\"3G\">手机页面</option></select><br>页面名称：<br/><input type=\"text\" name=\"pageName\" id=\"pageName\" style=\"width:210px;\" ><br>页面说明：<br/><textarea name=\"pageNote\"  id=\"pageNote\" style=\"width:210px;\" ></textarea></div>";
	$('#pdailog').dialog({
		title: '推送数据',
		width: 290,
		height: 280,
		closed: false,
		cache: false,
		modal: true,
		toolbar:null,
		content: ctx,
		buttons:[{
			text:'确定',
			iconCls:'icon-ok',
			handler:function(){
				var target = $("#pdailog #pushType").val();
				var name = $("#pdailog #pageName").val();
				var note = $("#pdailog #pageNote").val();
				if(target == ''){
					msginfo("请选择数据推送到哪里？", "error");
					return;
				}
				if(name == ''){
					msginfo("请填写推送的页面名称！", "error");
					$("#pdailog #pageName").focus();
					return;
				}
				if(note == ''){
					msginfo("请填写推送的页面说明信息！", "error");
					$("#pdailog #pageNote").focus();
					return;
				}
				//给表格组件添加kpiOther
				for(i=0; i<pageInfo.comps.length; i++){
					if(pageInfo.comps[i].type != 'text' && pageInfo.comps[i].kpiJson == undefined){
						msginfo("组件中无数据，请先添加度量。", "error");
						$('#pdailog').dialog('close');
						return;
					}
					if(pageInfo.comps[i].type == 'table'){
						pageInfo.comps[i].tableJson.cols.push({"type":"kpiOther","id":"kpi"});
					}
				}
				var json =  JSON.stringify(pageInfo);
				//移除kpiOther
				for(i=0; i<pageInfo.comps.length; i++){
					if(pageInfo.comps[i].type == 'table'){
						pageInfo.comps[i].tableJson.cols.pop();
					}
				}
				//获取DAY_ID
				var dayParam = "";
				for(i=0; pageInfo.params&&i<pageInfo.params.length; i++){
					if(pageInfo.params[i].type == 'day'){
						dayParam = pageInfo.params[i].colname;
					}
				}
				$.ajax({
					type:'POST',
					url:"ReportDesign!push.action",
					data:{"pushType":target, "pageName":name, "pageNote":note, "dayParam":dayParam, "pageInfo":json},
					success: function(){
						msginfo("数据推送成功！","success");
					}
				});
				$('#pdailog').dialog('close');
			}
			},{
			text:'取消',
			iconCls:"icon-cancel",
			handler:function(){
				$('#pdailog').dialog('close');
			}
		}]
	});
}
**/
//导出某个组件
function exportComp(compId){
	var comp = findCompById(compId);
	var ctx = "<form name='expff' method='post' action=\""+(curTmpInfo.expUrl?curTmpInfo.expUrl:"ReportExport.action")+"\" id='expff'><input type='hidden' name='type' id='type'><input type='hidden' name='json' id='json'><div class='exportpanel'><span class='exptp select' tp='html'><img src='../resource/img/export-html.gif'><br>HTML</span>"+
			"<span class='exptp' tp='csv'><img src='../resource/img/export-csv.gif'><br>CSV</span>" +
			"<span class='exptp' tp='excel'><img src='../resource/img/export-excel.gif'><br>EXCEL</span>" + 
			"<span class='exptp' tp='word'><img src='../resource/img/export-word.gif'><br>WORD</span>" + 
			"<span class='exptp' tp='pdf'><img src='../resource/img/export-pdf.gif'><br>PDF</span></div></form>";
	$('#pdailog').dialog({
		title: '导出数据',
		width: 376,
		height: 200,
		closed: false,
		cache: false,
		modal: true,
		toolbar:null,
		content: ctx,
		buttons:[{
					text:'确定',
					iconCls:'icon-ok',
					handler:function(){
						var tp = curTmpInfo.expType;
						$("#expff #type").val(tp);
						if(comp.type == "table"){
							comp.tableJson.cols.push({"type":"kpiOther","id":"kpi"});
						}
						$("#expff #json").val(JSON.stringify({comps:[comp], params:[]}));
						//移除kpiOther
						if(comp.type == "table"){
							comp.tableJson.cols.pop();
						}
						
						$("#expff").submit();
						$('#pdailog').dialog('close');
					}
				},{
					text:'取消',
					iconCls:"icon-cancel",
					handler:function(){
						$('#pdailog').dialog('close');
					}
				}]
	});
	curTmpInfo.expType = "html";
	//注册事件
	$(".exportpanel span.exptp").click(function(e) {
		$(".exportpanel span.exptp").removeClass("select");
        $(this).addClass("select");
		curTmpInfo.expType = $(this).attr("tp");
    });
}
//导出页面
function exportPage(tp){
	var ctx = "<form name='expff' method='post' action=\"ReportExport.action\" id='expff'><input type='hidden' name='type' id='type'><input type='hidden' name='json' id='json'><input type='hidden' name='picinfo' id='picinfo'></form>";
	if($("#expff").size() == 0){
		$(ctx).appendTo("body");
	}
	//给表格组件添加kpiOther
	for(i=0; i<pageInfo.comps.length; i++){
		if(pageInfo.comps[i].type != 'text' && pageInfo.comps[i].kpiJson == undefined){
			msginfo("组件中无数据，请先添加度量。", "error");
			$('#pdailog').dialog('close');
			return;
		}
		if(pageInfo.comps[i].type == 'table'){
			pageInfo.comps[i].tableJson.cols.push({"type":"kpiOther","id":"kpi"});
		}
	}
	$("#expff #type").val(tp);
	$("#expff #json").val(JSON.stringify(pageInfo));
	//移除kpiOther
	for(i=0; i<pageInfo.comps.length; i++){
		if(pageInfo.comps[i].type == 'table'){
			pageInfo.comps[i].tableJson.cols.pop();
		}
	}
	//把图形转换成图片
	var strs = "";
	if(tp == "pdf" || tp == "excel" || tp == "word"){
		$("div.chartUStyle").each(function(index, element) {
			var id = $(this).attr("id");
			id = id.substring(1, id.length);
			var chart = echarts.getInstanceByDom(document.getElementById(id));
			var str = chart.getDataURL({type:'png', pixelRatio:1, backgroundColor: '#fff'});
			str = str.split(",")[1]; //去除base64标记
			str = $(this).attr("label") + "," + str; //加上label标记
			strs = strs  +  str;
			if(index != $("div.chartUStyle").size() - 1){
				strs = strs + "@";
			}
			
		});
	}
	$("#expff #picinfo").val(strs);
	$("#expff").submit();
}
function cleanData(){
	var idx = pageInfo.idx ? pageInfo.idx : "1";
	if(idx == "1"){
		pageInfo.comps[0] = {"name":"表格组件","id":1, "type":"table"};
		$("#T1 div.ctx").html(crtCrossTable());
		initDropDiv("1");
	}else if(idx == "2"){
		pageInfo.comps[1] = {"name":"","id":2, "type":"chart",chartJson:{type:"line",params:[]},kpiJson:[]};
		$("#T2 div.ctx").html(crtChart(2));
		initChartKpiDrop(2)
	}
}
function kpidesc(){
	$('#pdailog').dialog({
		title: '度量解释',
		width: 600,
		height: 350,
		closed: false,
		cache: false,
		modal: true,
		toolbar:null,
		buttons:[{
					text:'关闭',
					iconCls:"icon-ok",
					handler:function(){
						$('#pdailog').dialog('close');
					}
				}]
	});
	$('#pdailog').dialog('refresh', "DataSet!kpidesc.action?selectDsIds="+pageInfo.selectDs, {a:1,b:2});
}