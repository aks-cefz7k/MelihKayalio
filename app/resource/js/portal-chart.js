if($ == undefined){
	$ = jQuery;
}
/**
 * 插入图形前先调用 图形类型选择框
 * @param layoutId
 * @param charttype
 * @return
 */
function insertChart(layoutId, charttype, typeIndex, maparea){
	var tp = charttype ? charttype : "line";
	curTmpInfo.charttype = tp; //放入全局对象，后面crtChart方法访问
	var compId = newGuid();
	var name = "图表";
	var comp = {"id":compId, "name":name, "type":"chart"};
	comp.chartJson = {"type":tp, maparea:maparea, typeIndex:typeIndex, xcol:{}, ycol:{}, scol:{}, params:[],height:tp == 'map' ? '400':'250'};
	if(curTmpInfo.is3g == "y"){
		//3G 报表图形宽度为100%
		comp.chartJson.width = "100%";
	}else{
		comp.chartJson.width = tp=='pie'||tp=='gauge'?'360':'600';
	}
	comp.kpiJson = [null, null, null];
	var str = addComp(comp, layoutId, true);
	$("#layout_"+layoutId).append(str);
	//注册拖放事件
	bindCompEvent(comp);
	//滚动位置
	window.setTimeout(function(){
		$("#optarea").scrollTop($("#c_"+compId).offset().top);
	}, 500);
}
function editChartData(compId, layoutId){
	if($("#dataProperty").size() == 0){
		$('#Jlayout').layout('add', {region:"south", id:"dataProperty", split:false, collapsible:false,height : 120, title:'编辑图形数据', tools:[{
		 iconCls:'icon-cancel',
		 handler:function(){
			 $('#Jlayout').layout("remove", "south");
		}
	 }]});
	}else{
		$('#Jlayout').layout('panel', "south").panel("setTitle", "编辑图形数据");
	}
	//切换数据到立方体
	$("#comp_tab").tabs("select", 1);
	
	var comp = findCompById(compId);
	var charttype = comp.chartJson.type;
	var ispie = false;
	var isscatter = false;
	var isbubble = false;
	var ismap = false;
	ispie = charttype == 'pie' || charttype == 'gauge';
	isscatter = charttype == 'bubble' || charttype == 'scatter';
	isbubble = charttype == 'bubble';
	ismap = charttype == "map";
	
	var y2str = ""; //第二纵轴
	if(comp.kpiJson[1] != null){
		y2str = "<span title=\""+comp.kpiJson[1].kpi_name+"\" class=\"charttxt\">"+(comp.kpiJson[1].kpi_name)+"</span><span onclick=\"chartmenu(this, "+comp.kpiJson[1].kpi_id+",'y2col','"+comp.kpiJson[1].kpi_name+"','"+compId+"')\" title=\"配置\" class=\"charticon\"></span>";
	}else{
		y2str = "<span class=\"charttip\">将度量拖到这里</span>";
	}
	
	var str =  "<div class=\"tsbd\">" + (isscatter?"<div class=\"ts_h\">" + (ispie ? "观察维度" : "横轴")+"：<div id=\"y2col\" class=\"h_ctx\">"+(comp.kpiJson[1]!=null?"<span title=\""+comp.kpiJson[1].kpi_name+"\" class=\"charttxt\">"+(comp.kpiJson[1].kpi_name)+"</span><span onclick=\"chartmenu(this, "+comp.kpiJson[1].kpi_id+",'y2col','"+comp.kpiJson[1].kpi_name+"','"+compId+"')\" title=\"配置\" class=\"charticon\"></span>":"<span class=\"charttip\">将度量拖到这里</span>")+"</div></div>":"<div class=\"ts_h\">" + (ispie ? "观察维度" : (ismap?"地域维度":"横轴"))+"：<div id=\"xcol\" class=\"h_ctx\">"+(comp.chartJson.xcol&&comp.chartJson.xcol.id?"<span class=\"charttxt\" title=\""+comp.chartJson.xcol.dimdesc+"\">"+comp.chartJson.xcol.dimdesc+"</span><span onclick=\"chartmenu(this, "+comp.chartJson.xcol.id+",'xcol', '"+comp.chartJson.xcol.dimdesc+"','"+compId+"')\" title=\"配置\" class=\"charticon\"></span>":"<span class=\"charttip\">"+(ismap?"将地域拖到这里":"将维度拖到这里")+"</span>")+"</div></div>") + 
	"<div class=\"ts_h\">"+(ispie||ismap?"度量":"纵轴")+"：<div id=\"ycol\" class=\"h_ctx\">"+(comp.kpiJson[0]!=null?"<span class=\"charttxt\" title=\""+comp.kpiJson[0].kpi_name+"\">"+(comp.kpiJson[0].kpi_name)+"</span><span onclick=\"chartmenu(this, "+comp.kpiJson[0].kpi_id+",'ycol','"+comp.kpiJson[0].kpi_name+"','"+compId+"')\" title=\"配置\" class=\"charticon\"></span>":"<span class=\"charttip\">将度量拖到这里</span>")+"</div></div>" +
	(isbubble ? "<div class=\"ts_h\">气泡大小：<div id=\"y3col\" class=\"h_ctx\">"+(comp.kpiJson[2]!=null?"<span title=\""+comp.kpiJson[2].kpi_name+"\" class=\"charttxt\">"+(comp.kpiJson[2].kpi_name)+"</span><span onclick=\"chartmenu(this, "+comp.kpiJson[2].kpi_id+",'y3col','"+comp.kpiJson[2].kpi_name+"','"+compId+"')\" title=\"配置\" class=\"charticon\"></span>":"<span class=\"charttip\">将度量拖到这里</span>")+"</div></div>":"") +
	(isscatter?"<div class=\"ts_h\">观察维度：<div id=\"xcol\" class=\"h_ctx\">"+(comp.chartJson.xcol&&comp.chartJson.xcol.id?"<span class=\"charttxt\" title=\""+comp.chartJson.xcol.dimdesc+"\">"+comp.chartJson.xcol.dimdesc+"</span><span onclick=\"chartmenu(this, "+comp.chartJson.xcol.id+",'xcol', '"+comp.chartJson.xcol.dimdesc+"','"+compId+"')\" title=\"配置\" class=\"charticon\"></span>":"<span class=\"charttip\">将维度拖到这里</span>")+"</div></div>":"") +
	/** 对于 (curTmpInfo.chart.chartJson.type=="column"&&curTmpInfo.chart.chartJson.typeIndex=="2" 表示双坐标轴，现在曲线图、柱状图都支持双坐标*/
	((charttype=="column"||charttype=="line")&&comp.chartJson.typeIndex=="2"?"<div class=\"ts_h\">第二纵轴：<div class=\"h_ctx\" id=\"y2col\">"+y2str+"</div></div>":"")+
	(isbubble || ismap ? "":"<div class=\"ts_h\" "+(ispie||(charttype=="column" && comp.chartJson.typeIndex=="2") ||(charttype=="line" && comp.chartJson.typeIndex=="2")?"style=\"display:none\"":"")+">图例：<div id=\"scol\" class=\"h_ctx\">"+(comp.chartJson.scol&&comp.chartJson.scol.id?"<span class=\"charttxt\" title=\""+comp.chartJson.scol.dimdesc+"\">"+comp.chartJson.scol.dimdesc+"</span><span onclick=\"chartmenu(this,"+comp.chartJson.scol.id+", 'scol', '"+comp.chartJson.scol.dimdesc+"','"+compId+"')\" title=\"配置\" class=\"charticon\"></span>":"<span class=\"charttip\">将维度拖到这里</span>")+"</div></div>") + "</div>";
	var ctx = "<div style=\"margin:10px;\"><div class=\"chartDatasty\" id=\"chartData\">"+str+"</div></div>";
	$("#dataProperty").html(ctx);
	//注册度量及维度拖拽事件
	initChartKpiDrop(compId);
}
function initChartKpiDrop(id){
	$("#chartData #xcol, #chartData #ycol, #chartData #y2col, #chartData #y3col, #chartData #scol").droppable({
		accept:"#datasettree .tree-node",
		onDragEnter:function(e,source){
			var node = $("#datasettree").tree("getNode", source);
			var tp = node.attributes.col_type;
			var targetid = $(this).attr("id");
			if(tp == 1 && (targetid == 'xcol' || targetid == 'scol')){
				$(source).draggable('proxy').find("span").removeClass("tree-dnd-no");
				$(source).draggable('proxy').find("span").addClass("tree-dnd-yes");
				$("#chartData #"+targetid).css("border-color", "#ff0000");
			}
			
			if(tp == 2 && (targetid == "ycol" || targetid == "y2col" || targetid == "y3col")){
				$(source).draggable('proxy').find("span").removeClass("tree-dnd-no");
				$(source).draggable('proxy').find("span").addClass("tree-dnd-yes");
				$("#chartData #" + targetid).css("border-color", "#ff0000");
			}
			e.cancelBubble=true;
			e.stopPropagation(); //阻止事件冒泡
		},
		onDragLeave:function(e,source){
			$(source).draggable('proxy').find("span").addClass("tree-dnd-no");
			$(source).draggable('proxy').find("span").removeClass("tree-dnd-yes");
			$("#chartData #"+$(this).attr("id")).css("border-color", "#7F9DB9");
			e.cancelBubble=true;
			e.stopPropagation(); //阻止事件冒泡
		},
		onDrop:function(e,source){
			var json = findCompById(id);
			//清除边框样式
			$("#chartData #"+$(this).attr("id")).css("border-color", "#7F9DB9");
			//获取TREE
			var node = $("#datasettree").tree("getNode", source);
			
			e.cancelBubble=true;
			e.stopPropagation(); //阻止事件冒泡
			
			//判断拖入的维度及度量是否和以前维度及度量在同一个表。
			if(json.cubeId != undefined){
				if(json.cubeId != node.attributes.cubeId){
					msginfo("您拖入的"+ (node.attributes.col_type == 2 ? "度量" : "维度") +"与组件已有的内容不在同一个数据表中，拖放失败。");
					return;
				}
			}
			//如果是地图，横轴必须是省/地市等地域维度
			if(json.chartJson.type == "map" && node.attributes.col_type == 1 && $(this).attr("id") == "xcol"){
			    if(!(node.attributes.dim_type == 'prov' || node.attributes.dim_type == 'city')){
				msginfo("地图只能拖放地域维度到横轴!");
				return;
			    }
			}
			json.cubeId = node.attributes.cubeId;
			json.dsetId = node.attributes.dsetId;
			json.dsid = node.attributes.dsid;
			var targetid = $(this).attr("id");

			if(node.attributes.col_type == 2 && (targetid == "ycol" || targetid == "y2col" || targetid == "y3col")){
				var ooo = {"kpi_id":node.attributes.col_id, "kpi_name" : node.text, ydispName:node.text, "col_name":node.attributes.col_name, "aggre":node.attributes.aggre, "fmt":node.attributes.fmt, "alias":node.attributes.alias,"unit":node.attributes.unit,"rate":node.attributes.rate,"tname":node.attributes.tname,"calc":node.attributes.calc};
				if(targetid == "ycol"){
					json.kpiJson[0] = ooo;
				}else if(targetid == "y2col"){
					json.kpiJson[1] = ooo;
				}else{
					json.kpiJson[2] = ooo;
				}
				json.chartJson.ycol = {"type":"kpi"};
				$(this).html("<span class=\"charttxt\" title=\""+node.text+"\">" + node.text + "</span><span class=\"charticon\" title=\"配置\" onclick=\"chartmenu(this, "+node.attributes.col_id+",'"+targetid+"','"+node.text+"','"+json.id+"')\"></span>");
				curTmpInfo.isupdate = true;
				chartview(json, id);
			}
			if(node.attributes.col_type == 1 && targetid == "xcol"){
				//判断是否在xcol中已经存在
				if(json.chartJson.scol != undefined && json.chartJson.scol.id == node.attributes.col_id){
					msginfo("您拖放的维度已存在于图例项中，不能拖放。")
					return;
				}
				
				//判断xcol 和 scol 是否属于一个分组，如果是，不让拖动
				var gt = node.attributes.grouptype;
				if(gt != null && gt != ''){
					if(json.chartJson.scol != undefined && json.chartJson.scol.grouptype == gt){
						msginfo("您拖放的维度与此图形中已有维度分类相同，不能拖放。")
						return;
					}
				}
				
				json.chartJson.xcol = {"id":node.attributes.col_id, "dimdesc" : node.text,xdispName:node.text, "type":node.attributes.dim_type, "colname":node.attributes.col_name,"iscas":node.attributes.iscas, "tableName":node.attributes.tableName, "tableColKey":node.attributes.tableColKey,"tableColName":node.attributes.tableColName, "dimord":node.attributes.dimord, "dim_name":node.attributes.dim_name, "grouptype":node.attributes.grouptype,"valType":node.attributes.valType, "ordcol":node.attributes.ordcol,"alias":node.attributes.alias,"tname":node.attributes.tname,"calc":node.attributes.calc};
				$(this).html("<span class=\"charttxt\" title=\""+node.text+"\">" + node.text + "</span><span class=\"charticon\" title=\"配置\" onclick=\"chartmenu(this, "+node.attributes.col_id+",'xcol', '"+node.text+"','"+json.id+"')\"></span>");
				curTmpInfo.isupdate = true;
				chartview(json, id);
			}
			if(node.attributes.col_type == 1 && targetid == "scol"){
				//判断是否在xcol中已经存在
				if(json.chartJson.xcol != undefined && json.chartJson.xcol.id == node.attributes.col_id){
					msginfo("您拖放的维度已存在于横轴中，不能拖放。")
					return;
				}
				
				//判断xcol 和 scol 是否属于一个分组，如果是，不让拖动
				var gt = node.attributes.grouptype;
				if(gt != null && gt != ''){
					if(json.chartJson.xcol != undefined && json.chartJson.xcol.grouptype == gt){
						msginfo("您拖放的维度与此图形中已有维度分类相同，不能拖放。")
						return;
					}
				}
				
				json.chartJson.scol = {"id":node.attributes.col_id, "dimdesc" : node.text, "type":node.attributes.dim_type, "colname":node.attributes.col_name,"iscas":node.attributes.iscas, "tableName":node.attributes.tableName, "tableColKey":node.attributes.tableColKey,"tableColName":node.attributes.tableColName, "dimord":node.attributes.dimord, "dim_name":node.attributes.dim_name, "grouptype":node.attributes.grouptype,"valType":node.attributes.valType, "ordcol":node.attributes.ordcol, "alias":node.attributes.alias,"tname":node.attributes.tname,"calc":node.attributes.calc};
				$(this).html("<span class=\"charttxt\" title=\""+node.text+"\">" + node.text + "</span><span class=\"charticon\" title=\"配置\" onclick=\"chartmenu(this,"+node.attributes.col_id+", 'scol', '"+node.text+"','"+json.id+"')\"></span>");
				curTmpInfo.isupdate = true;
				chartview(json, id);
			}
		}
	});
}
/**
 * 如果 addChart == true, 调用insertChart函数 
 * @param addChart
 * @param layoutId
 * @param compId
 * @return
 */
function setcharttype(addChart, layoutId){
	if(!layoutId){
		layoutId = curTmpInfo.layoutId;
	}
	var comp;
	var ctp;
	var cindex;
	var maparea;
	if(!addChart){
		comp =  findCompById(curTmpInfo.compId);
		ctp = comp.chartJson.type;
		cindex = comp.chartJson.typeIndex;
		maparea = comp.chartJson.maparea;
	}
	if($("#cpdailog").size() == 0){
		$("<div id=\"cpdailog\"></div>").appendTo("body");
	}
	$('#cpdailog').dialog({
		title: "选择图表类型",
		width: 550,
		height: 386,
		closed: false,
		cache: false,
		modal: true,
		toolbar:null,
		href:'ChartView!chartType.action',
		onLoad:function(){
			//如果是 addChart 设置默认值
			var cid;
			if(addChart){
				cid = 1;
				cindex = "1";
				maparea = "china";
			}else{ //回写值
				var cid = 1;
				if(ctp == 'line'){
					cid = 1;
				}else if(ctp == 'column'){
					cid = 2;
				}else if(ctp == 'pie'){
					cid = 3;
				}else if(ctp == 'radar'){
					cid = 5;
				}else if(ctp == 'gauge'){
					cid = 4;
				}else if(ctp == 'scatter'){
					cid = 6;
				}else if(ctp == 'bubble'){
					cid = 7;
				}else if(ctp == 'bar'){
					cid = 8;
				}else if(ctp == 'area'){
					cid = 9;
				}else if(ctp == "map"){
					cid = 10;
				}
				cindex = comp.chartJson.typeIndex;
				if(!cindex){
					cindex = "1";
				}
			}
			$(".chartselect .selleft ul li[cid='"+cid+"']").addClass("select");
			$(".chartselect .selright .one").css("display", "none");
			$("#cpdailog #schart" + cid).css("display", "block");
			//选中二级
			$("#cpdailog #schart"+cid+" span[index='"+cindex+"']").addClass("select");
			
			//选择图形类型事件
			$(".chartselect .selleft ul li").bind("click", function(){
				var cid = $(this).attr("cid");
				$(".chartselect .selleft ul li").removeClass("select");
				$(this).addClass("select");
				$(".chartselect .selright .one").css("display", "none");
				$("#cpdailog #schart" + cid).css("display", "block");
				//控制二级
				$(".chartselect .selright .one span.charttype").removeClass("select");
				$("#cpdailog #schart"+cid+" span[index='1']").addClass("select");
				
				var tp = $("#cpdailog #schart" + cid).attr("tp");
				ctp = tp;
				cindex = "1";
			});
			
			//右边选择
			$(".chartselect .selright .one span.charttype").bind("click", function(){
				$(".chartselect .selright .one span.charttype").removeClass("select");
				$(this).addClass("select");
				cindex = $(this).attr("index");
			});
			
			//地图地域选择
			$("#cpdailog #maparea").val(maparea).bind("change", function(){
				maparea = $(this).val();
			});
			
		},
		onClose:function(){
			$('#cpdailog').dialog('destroy');
		},
		buttons:[{
				text:'确定',
				handler:function(){
					$('#cpdailog').dialog('close');
					if(addChart){
						insertChart(layoutId, ctp, cindex, maparea);
					}else{
						comp.chartJson.type = ctp;
						comp.chartJson.typeIndex = cindex;
						if(ctp == "bubble" || ctp == "pie" || ctp =="gauge" || (ctp=="line"&&cindex=="2") || (ctp=="column"&&cindex=="2")){
							comp.chartJson.scol = {};  //气泡图, 饼图、仪表盘清除scol, 多轴曲线图和柱状图，清除scol
						}
						if(ctp != "bubble" && ctp != "scatter"){  //除了散点图和气泡图，清除第二度量，第三度量
							comp.kpiJson[1] = null;
							comp.kpiJson[2] = null;
						}
						if(ctp == "map"){
							comp.chartJson.maparea = maparea;
						}else{
							delete comp.chartJson.maparea;
						}
						$('#Jlayout').layout("remove", "east");
						 $('#Jlayout').layout("remove", "south");
						chartview(comp, comp.id);
					}
				}
			},{
				text:'取消',
				handler:function(){
					$('#cpdailog').dialog('close');
				}
			}
		]});
}
function resetchart(compId){
	//重置图形区域为空
	$("#c_" + compId + " div.cctx").html("<div align=\"center\" class=\"tipinfo\">(点击组件右上角设置按钮配置图形数据)</div>");
}
function chartview(json, compId){
	if(json.kpiJson[0] == null){
		resetchart(compId);
		return;
	}
	if(json.chartJson.type == "scatter" && json.kpiJson[1] == null  ){
		resetchart(compId);
		return;
	}
	if(json.chartJson.type == "bubble" && json.kpiJson[2] == null  ){
		resetchart(compId);
		return;
	}
	showloading();
	var chartJson = JSON.stringify(json.chartJson);
	var kpiJson = JSON.stringify(json.kpiJson);
	var kpiType = json.ttype;
	//处理参数
	var params = json.params ? JSON.stringify(json.params) : "[]";
	var pageParam = pageInfo.params ? JSON.stringify(pageInfo.params) : "[]";
	$.ajax({
	   type: "POST",
	   url: "ChartView.action",
	   dataType:"html",
	   data: {"chartJson":chartJson, "kpiJson":kpiJson, "compId":compId, "params":params, "pageParams":pageParam, dsource:json.dsid, dset:json.dsetId},
	   success: function(resp){
		   hideLoading();
		  $("#c_" + compId + " div.cctx").html(resp);
	   },
	   error:function(resp){
		   hideLoading();
		   $.messager.alert('出错了','系统出错，请查看后台日志。','error');
	   }
	});
}
function setChartProperty(comp){
	if($("#compSet").size() == 0){
		$('#Jlayout').layout('add', {region:"east", split:false, width:240, title:"图形属性设置", collapsible:false, id:"compSet",  tools:[{
		 iconCls:'icon-cancel',
		 handler:function(){
			 $('#Jlayout').layout("remove", "east");
		}
	 }]});
	}else{
		$('#Jlayout').layout('panel', "east").panel("setTitle", "图形属性设置");
	}
	if(!comp.style){
		comp.style = {};
	}
	s = comp.style;
	var ctp = comp.chartJson.type;
	var dt = [];
	dt.push({name:'图形标题',col:'title', value:(comp.name?comp.name:""), group:'图形属性', editor:'text'});
	dt.push({name:'高度',col:'height', value:(comp.chartJson.height?comp.chartJson.height:""), group:'图形属性', editor:'numberbox'});
	if(curTmpInfo.is3g == "y"){
		//3G模式下，图形的宽度不可更改
		dt.push({name:'宽度',col:'width', value:(comp.chartJson.width?comp.chartJson.width:""), group:'图形属性'});
	}else{
		dt.push({name:'宽度',col:'width', value:(comp.chartJson.width?comp.chartJson.width:""), group:'图形属性', editor:'numberbox'});
	}
	if(ctp != 'gauge'){
		dt.push({name:'是否隐藏图例',col:'showLegend', value:(comp.chartJson.showLegend?comp.chartJson.showLegend:""), group:'图形属性',editor:{
			type:"checkbox",
			options:{"on":true, "off":false}
		}});
		dt.push({name:'图例位置',col:'legendpos', value:(comp.chartJson.legendpos?comp.chartJson.legendpos:""), group:'图形属性',editor:{
				type:"combobox",
				options:{data:[{text: '右上', value: 'righttop'},{text: '中上', value: 'centertop'},{text: '中下', value: 'centerbottom'}]}
			}
		});
	}
	if(ctp != 'gauge'){
		dt.push({name:'排列方式',col:'legendLayout', value:(comp.chartJson.legendLayout?comp.chartJson.legendLayout:""), group:'图形属性', editor: {
			type:'combobox', options:{data:[{text: '垂直', value: 'vertical'},{text: '水平', value: 'horizontal'}]}
		}});
	}
	if(ctp == "line" || ctp == "area" || ctp == "radar"){
		dt.push({name:'是否禁用描点',col:'markerEnabled', value:(comp.chartJson.markerEnabled?comp.chartJson.markerEnabled:""), group:'图形属性',editor:{
			type:"checkbox",
			options:{"on":true, "off":false}
		}});
	}
	if(ctp == "pie" || ctp == "gauge" || ctp == "radar" || ctp == "map"){   //控制设置图形的marginleft 和 marginright
	}else{
		dt.push({name:'左间距',col:'marginLeft', value:(comp.chartJson.marginLeft?comp.chartJson.marginLeft:""), group:'图形属性', editor:'numberbox'});
		dt.push({name:'右间距',col:'marginRight', value:(comp.chartJson.marginRight?comp.chartJson.marginRight:""), group:'图形属性', editor:'numberbox'});
	}
	if(ctp == "pie" || ctp == "gauge" || ctp == "scatter" || ctp == "bubble" || ctp == "radar" || ctp == "map"){
		
	}else{
		dt.push({name:'标题',col:'xdispName', value:(comp.chartJson.xcol?comp.chartJson.xcol.xdispName:""), group:'横轴', editor:'text'});
	}
	if(ctp == 'pie' || ctp =="gauge" || ctp == "scatter" || ctp == "bubble" || ctp == "radar" || ctp == "map"){
		
	}else{
		dt.push({name:'显示间隔',col:'tickInterval', value:(comp.chartJson.xcol&&comp.chartJson.xcol.tickInterval?comp.chartJson.xcol.tickInterval:""), group:'横轴', editor:'numberbox'});
	}
	if(ctp == 'pie' || ctp =="gauge" || ctp == "scatter" || ctp == "bubble" || ctp == "radar" || ctp == "map"){
		
	}else{
		dt.push({name:'旋转角度',col:'routeXaxisLable', value:(comp.chartJson.xcol&&comp.chartJson.xcol.routeXaxisLable?comp.chartJson.xcol.routeXaxisLable:""), group:'横轴', editor:'numberbox'});
	}
	if(ctp == "gauge" || ctp == "scatter" || ctp == "bubble" || ctp == "radar" || ctp == "map"){
	}else{
		dt.push({name:'取Top',col:'top', value:(comp.chartJson.xcol.top?comp.chartJson.xcol.top:""), group:'横轴', editor:'numberbox'});
	}
	//散点图或气泡图需要y2轴的属性
	if(ctp =="scatter" || ctp == "bubble"){
		dt.push({name:'标题',col:'y2dispName', value:(comp.kpiJson[1]!=null?comp.kpiJson[1].ydispName:""), group:'横轴', editor:'text'});
		dt.push({name:'单位',col:'unit2', value:(comp.kpiJson[1]!=null?comp.kpiJson[1].unit:""), group:'横轴', editor:'text'});
		dt.push({name:'格式化',col:'fmt2', value:(comp.kpiJson[1]!=null?comp.kpiJson[1].fmt:""), group:'横轴', editor:{
			type:'combobox',
			options:{data:fmtJson}
		}});
		dt.push({name:'度量比例',col:'rate2', value:(comp.kpiJson[1]!=null?comp.kpiJson[1].rate:""), group:'横轴', editor:{
			type:'combobox',
			options:{data:kpirate}
		}});
	}
	if(ctp != 'pie' ){
		dt.push({name:'标题',col:'ydispName', value:(comp.kpiJson[0]!=null?comp.kpiJson[0].ydispName:""), group:'纵轴', editor:'text'});
	}
	
	dt.push({name:'单位',col:'unit', value:(comp.kpiJson[0]!=null?comp.kpiJson[0].unit:""), group:'纵轴', editor:'text'});
	dt.push({name:'格式化',col:'fmt', value:(comp.kpiJson[0]!=null?comp.kpiJson[0].fmt:""), group:'纵轴', editor:{
		type:'combobox',
		options:{data:fmtJson}
	}});
	
	if(ctp == "pie" || ctp == "scatter" || ctp == "bubble" || ctp == "map" || ctp == "radar"){
		
	}else{
		dt.push({name:'最小值',col:'ymin', value:(comp.kpiJson[0]!=null?comp.kpiJson[0].ymin:""), group:'纵轴', editor:'numberbox'});
	}
	if(ctp == "gauge"){
		dt.push({name:'最大值',col:'ymax', value:(comp.kpiJson[0]!=null?comp.kpiJson[0].ymax:""), group:'纵轴', editor:'numberbox'});
	}
	dt.push({name:'度量比例',col:'rate', value:(comp.kpiJson[0]!=null?comp.kpiJson[0].rate:""), group:'纵轴', editor:{
		type:'combobox',
		options:{data:kpirate}
	}});
	
	if(ctp == "pie"){
		dt.push({name:'是否显示标签',col:'dataLabel', value:(comp.chartJson.dataLabel?comp.chartJson.dataLabel:""), group:'图形属性', editor:{
			type:"checkbox",
			options: {"on":true, "off":false}
		}});
	}
	
	if((ctp == "column" || ctp == "line") && comp.chartJson.typeIndex=="2"){ //双坐标设置第二坐标
		dt.push({name:'标题',col:'y2dispName', value:(comp.kpiJson[1]!=null?comp.kpiJson[1].ydispName:""), group:'第二纵轴', editor:'text'});
		dt.push({name:'单位',col:'unit2', value:(comp.kpiJson[1]!=null?comp.kpiJson[1].unit:""), group:'第二纵轴', editor:'text'});
		dt.push({name:'格式化',col:'fmt2', value:(comp.kpiJson[1]!=null?comp.kpiJson[1].fmt:""), group:'第二纵轴', editor:{
			type:'combobox',
			options:{data:fmtJson}
		}});
		dt.push({name:'度量比例',col:'rate2', value:(comp.kpiJson[1]!=null?comp.kpiJson[1].rate:""), group:'第二纵轴', editor:{
			type:'combobox',
			options:{data:kpirate}
		}});
	}
	
	$('#compSet').propertygrid({
		showGroup:true,
		border:false,
		showHeader:false,
		fitColumns:false,
		scrollbarSize: 0,
		onAfterEdit: function(rowIndex,rowData,changes){
			var val = rowData.value;
			var col = rowData.col;
			if(col == "showLegend" || col == "legendLayout" || col == "legendpos" || col == "dataLabel" || col == "markerEnabled" || col == "marginLeft" || col == "marginRight"){
				if(comp.chartJson[col]==undefined){
					comp.chartJson[col] = "";
				}
				if(comp.chartJson[col] == val){ //值未改变
					return;
				}
				comp.chartJson[col] = val;
				chartview(comp, comp.id);
				
			}else 
			if(col == "height" || col == "width"){
				if(curTmpInfo.is3g == "y" && col == "width"){  //3G 页面不能设置width
					return;
				}
				comp.chartJson[col] = val;
				//获取chart对象
				/**
				var charts = Highcharts.charts;
				var chart = null;
				for(i=0;i<charts.length;i++){
					var c = charts[i];
					if($(c.container).parent().attr("id") ==  "C" + comp.id){
						chart = c;
					}
				}
				chart.setSize(curTmpInfo.is3g == "y"?458:comp.chartJson.width, comp.chartJson.height);
				**/
				$("#C"+comp.id).css({"width" : comp.chartJson.width+"px", "height": comp.chartJson.height+"px"});
				var chart = echarts.getInstanceByDom(document.getElementById('C'+comp.id));
				chart.resize('auto', 'auto');
			}else if(col == "tickInterval" || col == "routeXaxisLable" || col == "xdispName" || col == "top"){
				if(comp.chartJson.xcol[col]==undefined){
					comp.chartJson.xcol[col] = "";
				}
				if(comp.chartJson.xcol[col] == val){ //值未改变
					return;
				}
				comp.chartJson.xcol[col] = val;
				chartview(comp, comp.id);
			}else if(col == "ydispName" || col == "unit" || col == "fmt" || col == "ymin" || col == "ymax" || col == "rate"){
				var o = comp.kpiJson[0];
				if(o[col]==undefined){
					o[col] = "";
				}
				if(o[col] == val){ //值未改变
					return;
				}
				o[col] = val;
				chartview(comp, comp.id);
			}else if(col == "y2dispName" || col == "unit2" || col == "fmt2" || col == "rate2"){	//处理y2col y2轴
				var o = comp.kpiJson[1];
				
				if(col == "y2dispName"){
					if(o.ydispName == val){  //值未改变
						return;
					}
					o.ydispName = val;
				}else if(col == "unit2"){
					if(o.unit == val){ //值未改变
						return;
					}
					o.unit = val;
				}else if(col == "fmt2"){
					if(o.fmt == val){ //值未改变
						return;
					}
					o.fmt = val;
				}else if(col == "rate2"){
					if(o.rate == val){ //值未改变
						return;
					}
					o.rate = val;
				}
				chartview(comp, comp.id);
			}else if(col == "title"){
				comp.name = val;
				$("#c_"+comp.id + " div.ctit").text(val);
			}else{
				s[col] = val;
			}
			curTmpInfo.isupdate = true;
		},
		data:dt
	});
}
function chartmenu(ts, id, tp, name, compId){
	var offset = $(ts).offset();
	//放入临时对象中，方便下次获取
	curTmpInfo.ckid = id;
	curTmpInfo.tp = tp;
	curTmpInfo.compId = compId;
	curTmpInfo.dimname = name;
	
	if(tp == 'ycol' || tp == 'y2col' || tp=='y3col'){
		$("#chartoptmenu").menu("enableItem", $("#m_set"));
	}else{
		$("#chartoptmenu").menu("disableItem", $("#m_set"));
	}
	$("#chartoptmenu").menu("show", {left:offset.left, top:offset.top - 5});
}
function delChartKpiOrDim(){
	var tp = curTmpInfo.tp;
	var compId = curTmpInfo.compId;
	var id = curTmpInfo.ckid;
	var json = findCompById(compId);
	
	if(tp == 'xcol'){
		json.chartJson.xcol = {};
		$("#chartData #xcol").html("<span class=\"charttip\">将维度拖到这里</span>");
		curTmpInfo.isupdate = true;
		chartview(json, compId);
	}
	if(tp == 'ycol'){
		json.chartJson.ycol = {};
		if(json.kpiJson.length > 1){
			json.kpiJson[0] = null;
		}else{
			json.kpiJson = [];
		}
		$("#chartData #ycol").html("<span class=\"charttip\">将度量拖到这里</span>");
	}
	if(tp == 'y2col'){
		if(json.kpiJson.length > 1){
			json.kpiJson[1] = null;
		}else{
			json.kpiJson = [];
		}
		if(json.chartJson.type == 'line' || json.chartJson.type == 'column'){
			chartview(json, compId);
		}
		$("#chartData #y2col").html("<span class=\"charttip\">将度量拖到这里</span>");
	}
	if(tp == 'y3col'){
		json.kpiJson[2] = null;
		$("#chartData #y3col").html("<span class=\"charttip\">将度量拖到这里</span>");
	}
	if(tp == 'scol'){
		json.chartJson.scol = {};
		$("#chartData #scol").html("<span class=\"charttip\">将维度拖到这里</span>");
		curTmpInfo.isupdate = true;
		chartview(json, compId);
	}
}
function chartsort(sorttp){
	var tp = curTmpInfo.tp;
	var compId = curTmpInfo.compId;
	var id = curTmpInfo.ckid;
	var json = findCompById(compId);
	
	if(tp == 'xcol'){
		//清除度量排序,因为度量排序最优先
		delete json.kpiJson[0].sort;
		json.chartJson.xcol.dimord = sorttp;
	}
	if(tp == 'ycol'){
		json.kpiJson[0].sort = sorttp;
	}
	if(tp == 'scol'){
		//清除度量排序
		delete json.kpiJson[0].sort;
		json.chartJson.scol.dimord = sorttp;
	}
	curTmpInfo.isupdate = true;
	chartview(json, compId);
}
function setChartKpi(){
	var tp = curTmpInfo.tp;
	if(tp == 'xcol' || tp == 'scol'){
		return;
	}
	var dimid = curTmpInfo.ckid;
	var compId = curTmpInfo.compId.replace("T", "");
	var name = curTmpInfo.dimname;
	//获取组件的JSON对象
	var comp = findCompById(compId);
	var kpi = null;
	if(tp == 'ycol'){
		kpi = comp.kpiJson[0];
	}else if(tp == 'y2col'){
		kpi = comp.kpiJson[1];
	}else if(tp == 'y3col'){
		kpi = comp.kpiJson[2];
	}
	var ctx = "<div style='line-height:25px; margin:5px;'>度量名称："+kpi.kpi_name+"<br>所 属 表： "+comp.tname+"<br>度量单位：<select id=\"kpiunit\" name=\"kpiunit\"><option value='1'></option><option value='1000'>千</option><option value='10000'>万</option><option value='1000000'>百万</option><option value='100000000'>亿</option></select>"+kpi.unit+"<br>格 式 化："+
		"<select id=\"fmt\" name=\"fmt\"><option value=\"\"></option><option value=\"#,###,##0\">整数</option><option value=\"###,##0.0\">小数</option><option value=\"0.00%\">百分比</option></select>" + "</div>";
	$('#pdailog').dialog({
		title: '度量属性',
		width: 280,
		height: 260,
		closed: false,
		cache: false,
		modal: true,
		content: ctx,
		toolbar:null,
		buttons:[{
					text:'确定',
					iconCls:'icon-ok',
					handler:function(){
						kpi.fmt = $("#pdailog #fmt").val();
						kpi.rate = Number($("#pdailog #kpiunit").val());
						$('#pdailog').dialog('close');
						curTmpInfo.isupdate = true;
						chartview(comp, compId);
					}
				},{
					text:'取消',
					iconCls:"icon-cancel",
					handler:function(){
						$('#pdailog').dialog('close');
					}
				}]
	});
	$("#pdailog #fmt").find("option[value='"+kpi.fmt+"']").attr("selected",true);
	$("#pdailog #kpiunit").find("option[value='"+kpi.rate+"']").attr("selected",true);
}
function findDimById(dimId, dims){
	var ret = null;
	if(!dims || dims == null){
		return ret;
	}
	for(var i=0; i<dims.length; i++){
		if(dims[i].id == dimId){
			ret = dims[i];
			break;
		}
	}
	return ret;
}