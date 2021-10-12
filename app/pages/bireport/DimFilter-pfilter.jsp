<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>

     	<s:if test="#request.dimType == 'month'">
			<div style="margin:20px;">
            <p/>
            开始月份：   
            <select name="dfm2" id="dfm2" class="inputform2">
                <s:iterator var="e" value="#request.datas" status="statu">
             <option value="${e.id}" <s:if test="id == #request.dfm2">selected</s:if> >${e.name}</option>
             </s:iterator>
            </select>
            <p/>
            结束月份：
            <select name="dfm1" id="dfm1" class="inputform2">
                <s:iterator var="e" value="#request.datas" status="statu">
             <option value="${e.id}" <s:if test="id == #request.dfm1">selected</s:if>>${e.name}</option>
             </s:iterator>
            </select>
			</div>
        </s:if>
        <s:elseif test="#request.dimType == 'day'">
	
			<div style="margin:20px;">
            <p/>
            开始日期： <input type="text" size="20" value="${dft2}" id="dft2" name="dft2" readonly="true" onclick="WdatePicker({dateFmt:'yyyy-MM-dd', minDate:'${min}', maxDate:'${max}'})" class="inputform2 Wdate"> <p/>
            结束日期： <input type="text" size="20" value="${dft1}" id="dft1" name="dft1" readonly="true" onclick="WdatePicker({dateFmt:'yyyy-MM-dd', minDate:'${min}', maxDate:'${max}'})" class="inputform2 Wdate">
            </div>
        </s:elseif>

<s:else>
<div >
<input id="dimsearch" style="width:280px;"></input>
</div>
<div class="dfilter">
<s:iterator var="e" value="#request.datas" status="statu">
<%
String id = pageContext.findAttribute("id") == null ? "" : pageContext.findAttribute("id").toString();
String ids = (String)request.getAttribute("vals");
if(id != null && id.length() > 0){  //忽略 id 为 null 的
%>	
<div class="checkbox checkbox-info"><input type="checkbox" id="d${statu.index}" name="dimval" desc="${name}" value="${id}" <%if(com.ruisi.vdop.web.bireport.DimFilterAction.exist(id, ids.split(","))){%>checked="true"<%}%> ><label for="d${statu.index}">${name}</label></div>
<%
}
%>
</s:iterator>
</div>
</s:else>

<script>
$(function(){
	$('#dimsearch').searchbox({
		searcher:function(value,name){
			searchDims2(value, ${dimId});
		},
		prompt:'请输入查询关键字.'
	});
	
});
</script>