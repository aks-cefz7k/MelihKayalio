package com.ruisi.vdop.ser.portal;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.ruisi.ext.engine.ExtConstants;
import com.ruisi.ext.engine.init.TemplateManager;
import com.ruisi.ext.engine.util.IdCreater;
import com.ruisi.ext.engine.view.context.ExtContext;
import com.ruisi.ext.engine.view.context.MVContext;
import com.ruisi.ext.engine.view.context.MVContextImpl;
import com.ruisi.ext.engine.view.context.cross.BaseKpiField;
import com.ruisi.ext.engine.view.context.cross.CrossKpi;
import com.ruisi.ext.engine.view.context.cross.CrossReportContext;
import com.ruisi.ext.engine.view.context.cross.RowDimContext;
import com.ruisi.ext.engine.view.context.dc.grid.GridDataCenterContext;
import com.ruisi.ext.engine.view.context.dc.grid.GridDataCenterContextImpl;
import com.ruisi.ext.engine.view.context.dc.grid.GridFilterContext;
import com.ruisi.ext.engine.view.context.dc.grid.GridSetConfContext;
import com.ruisi.ext.engine.view.context.form.InputField;
import com.ruisi.ext.engine.view.context.form.TextFieldContext;
import com.ruisi.ext.engine.view.context.form.TextFieldContextImpl;
import com.ruisi.ext.engine.view.exception.ExtConfigException;
import com.ruisi.ispire.dc.grid.GridFilter;
import com.ruisi.ispire.dc.grid.GridProcContext;
import com.ruisi.vdop.ser.bireport.ChartService;
import com.ruisi.vdop.ser.bireport.TableSqlJsonVO;
import com.ruisi.vdop.ser.bireport.TableSqlJsonVO.DimInfo;
import com.ruisi.vdop.ser.bireport.TableSqlJsonVO.KpiInfo;
import com.ruisi.vdop.ser.olap.TableJsonService;
import com.ruisi.vdop.service.frame.DataControlInterface;
import com.ruisi.vdop.util.VDOPUtils;

public class PortalTableService {
	
	public final static String deftMvId = "mv.test.tmp";
	
	private TableJsonService jsonService = new TableJsonService();
	
	private Map<String, InputField> mvParams = new HashMap(); //mv?????????
	
	private DataControlInterface dataControl; //??????????????????
	
	private JSONObject dset;  //?????????
	private JSONObject dsource; //?????????
		
	public PortalTableService(){
		String clazz = ExtContext.getInstance().getConstant("dataControl");
		if(clazz != null && clazz.length() != 0){
			try {
				dataControl = (DataControlInterface)Class.forName(clazz).newInstance();
			} catch (Exception e) {
				e.printStackTrace();
			} 
		}
	}

	/**
	 * ????????????SQL
	 * @param sqlVO
	 * @param tinfo
	 * @param params
	 * @param release  ?????????????????????????????????, 0 ?????????????????????1??????????????????????????????2????????????????????????
	 * @param drillLevel ?????????????????????0??????, 0??????????????????1?????????????????????????????????
	 * @return
	 * @throws ParseException
	 */
	public String createSql(TableSqlJsonVO sqlVO, JSONArray params, int release, int drillLevel) throws ParseException{
		Map<String, String> tableAlias = PortalPageService.createTableAlias(dset);
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		List<DimInfo> dims = sqlVO.getDims();
		for(int i=0; i<dims.size(); i++){
			DimInfo dim = dims.get(i);
			String t = dim.getTname();
			String key = dim.getTableColKey();
			String txt = dim.getTableColName();
			String tname = dim.getTableName();
			int iscalc = dim.getCalc();
			if(key != null && txt != null && key.length() >0 && txt.length() >0){
				sql.append(tableAlias.get(tname)+"."+key+", "+tableAlias.get(tname)+"." + txt + ",");
			}else{
				if(iscalc == 1){
					sql.append(dim.getColName()+" "+dim.getAlias()+", ");
				}else{
					sql.append(tableAlias.get(t)+"."+dim.getColName()+" "+dim.getAlias()+", ");
				}
			}
			
		}
		
		//???????????????
		JSONArray drillDim = sqlVO.getDrillDim();
		if(drillDim != null && drillDim.size() >= drillLevel){
			for(int i=0; i<drillLevel; i++){
				JSONObject dim = drillDim.getJSONObject(i);
				String key = (String)dim.get("tableColKey");
				String txt = (String)dim.get("tableColName");
				String tname = (String)dim.get("tableName");
				String t = (String)dim.get("tname");
				int iscalc = (Integer)dim.get("calc");
				if(key != null && txt != null && key.length() >0 && txt.length() >0){
					sql.append(tableAlias.get(tname)+"."+key+", "+ tableAlias.get(tname) +"." + txt + ",");
				}else{
					if(iscalc == 1){
						sql.append(dim.get("colname")+" "+dim.get("code")+", ");
					}else{
						sql.append(tableAlias.get(t)+"."+dim.get("colname")+" "+dim.get("code")+", ");
					}
				}
			}
			
		}
		
		List<KpiInfo> kpis = sqlVO.getKpis();
		if(kpis.size() == 0){
			sql.append(" null kpi_value ");
		}else{
			for(int i=0; i<kpis.size(); i++){
				KpiInfo kpi = kpis.get(i);
				//if(kpi.getRate() == null){
					sql.append(kpi.getColName() + " ");
				//}else{
				//	sql.append("(" + kpi.getColName() + ")/"+kpi.getRate()+" ");
				//}
				sql.append(kpi.getAlias());
				
				if(i != kpis.size() - 1){
					sql.append(",");
				}
			}
		}
		
		//???????????????SQL????????????????????????????????????
		JSONArray joinTabs = (JSONArray)dset.get("joininfo");
		String master = dset.getString("master");
		sql.append(" from " + master + " a0");
		
		for(int i=0; joinTabs!=null&&i<joinTabs.size(); i++){  //??????????????????
			JSONObject tab = joinTabs.getJSONObject(i);
			String ref = tab.getString("ref");
			String refKey = tab.getString("refKey");
			String jtype = (String)tab.get("jtype");
			if("left".equals(jtype) || "right".equals(jtype)){
				sql.append(" " + jtype);
			}
			sql.append(" join " + ref+ " " + tableAlias.get(ref));
			sql.append(" on a0."+tab.getString("col")+"="+tableAlias.get(ref)+"."+refKey);
			sql.append(" ");
			
		}
		sql.append(" where 1=1 ");
		
		//????????????
		if(dataControl != null){
			String ret = dataControl.process(VDOPUtils.getLoginedUser(), dset.getString("master"));
			if(ret != null){
				sql.append(ret + " ");
			}
		}
		
		//???????????????????????????
		sql.append(PortalTableService.dealCubeParams(params, tableAlias));
		
		//??????????????????????????????
		if(drillLevel == 1){
			DimInfo row = sqlVO.getCurrRowDim();
			String valType = row.getValType();
			String tname = row.getTname();
			if("String".equalsIgnoreCase(valType)){
				sql.append(" and "+ (row.getCalc() == 1 ?"":tableAlias.get(tname)+".") + row.getColName()+" = '$"+row.getAlias()+"'");
			}else{
				sql.append(" and " + (row.getCalc() == 1 ?"":tableAlias.get(tname)+".") + row.getColName()+" = $"+row.getAlias());
			}
		}
		
		//???????????????????????????????????????
		JSONObject linkAccept = sqlVO.getLinkAccept();
		if(linkAccept != null && !linkAccept.isNullObject() && !linkAccept.isEmpty()){
			String col = (String)linkAccept.get("col");
			String alias = (String)linkAccept.get("alias");
			String valtype = (String)linkAccept.get("valType");
			String ncol = "$" + alias;
			if("string".equalsIgnoreCase(valtype)){
				ncol = "'" + ncol + "'";
			}
			sql.append("#if($"+alias+" != '') and  " + col + " = " + ncol + " #end");
		}
		
		if(dims.size() > 0){
			sql.append(" group by ");
			for(int i=0; i<dims.size(); i++){
				DimInfo dim = dims.get(i);
				String key = dim.getTableColKey();
				String txt = dim.getTableColName();
				String tname = dim.getTableName();
				String t = dim.getTname();
				int calc = dim.getCalc();
				if(key != null && txt != null && key.length() >0 && txt.length() >0){
					sql.append(tableAlias.get(tname) + "." + key+", "+ tableAlias.get(tname) +"." + txt);
				}else{
					if(calc == 1){
						sql.append(dim.getColName());
					}else{
						sql.append(tableAlias.get(t) + "."+ dim.getColName());
					}
				}
				if(i != dims.size() - 1){
					sql.append(",");
				}
			}
			//?????????group by
			if(drillDim != null && drillDim.size() >= drillLevel){
				for(int i=0; i<drillLevel; i++){
					JSONObject dim = drillDim.getJSONObject(i);
					String key = (String)dim.get("tableColKey");
					String txt = (String)dim.get("tableColName");
					String tname = (String)dim.get("tableName");
					String t = (String)dim.get("tname");
					int iscalc = (Integer)dim.get("calc");
					if(key != null && txt != null && key.length() >0 && txt.length() >0){
						sql.append("," + (iscalc == 1 ? "":tableAlias.get(tname) + ".") + key);
					}else{
						sql.append("," + (iscalc == 1 ?"":tableAlias.get(t) + ".") + dim.get("code"));
					}
				}
			}
		}
		//??????????????????
		/**
		StringBuffer filter = new StringBuffer("");
		for(KpiInfo kpi : sqlVO.getKpis()){
			if(kpi.getFilter() != null){
				filter.append(" and "+kpi.getColName()+" ");
				String tp = kpi.getFilter().getFilterType();
				filter.append(tp);
				filter.append(" ");
				double val1 = kpi.getFilter().getVal1();
				if(kpi.getFmt() != null && kpi.getFmt().endsWith("%")){
					val1 = val1 / 100;
				}
				filter.append(val1 * (kpi.getRate() == null ? 1 : kpi.getRate()));
				if("between".equals(tp)){
					double val2 = kpi.getFilter().getVal2();
					if(kpi.getFmt() != null && kpi.getFmt().endsWith("%")){
						val2 = val2 / 100;
					}
					filter.append(" and " + val2 * (kpi.getRate() == null ? 1 : kpi.getRate()));
				}
			}
		}
		**/
		String retSql = null;
		
		if(dims.size() > 0){
			StringBuffer order = new StringBuffer();
			order.append(" order by ");
			//??????col??????
			for(int i=0; i<dims.size(); i++){
				DimInfo dim = dims.get(i);
				if(!dim.getDimpos().equals("col")){
					continue;
				}
				if(dim.getDimOrd() != null && dim.getDimOrd().length() > 0){
					if(dim.getOrdcol() != null && dim.getOrdcol().length() > 0){  //??????????????????
						order.append(dim.getOrdcol() + " " + dim.getDimOrd() + ",");
					}else{
						order.append(dim.getColName() + " " + dim.getDimOrd() + ",");
					}
				}
			}
			//???????????????????????????
			for(int i=0; i<kpis.size(); i++){
				KpiInfo kpi = kpis.get(i);
				if(kpi.getSort() != null && kpi.getSort().length() > 0){
					order.append(kpi.getAlias() + " " + kpi.getSort());
					order.append(",");
				}
			}
			
			//??????row??????
			for(int i=0; i<dims.size(); i++){
				DimInfo dim = dims.get(i);
				if(!dim.getDimpos().equals("row")){
					continue;
				}
				if(dim.getDimOrd() != null && dim.getDimOrd().length() > 0){
					if(dim.getOrdcol() != null && dim.getOrdcol().length() > 0){  //??????????????????
						order.append(dim.getOrdcol() + " " + dim.getDimOrd() + ",");
					}else{
						order.append(dim.getColName() + " " + dim.getDimOrd() + ",");
					}
				}
			}
			
			
			if(order.length() <= 11 ){  //????????????????????? order by ??????
				retSql = sql.toString();
			}else{
				//?????????????????????????????????
				retSql = sql + order.toString().substring(0, order.length() - 1);
			}
		}else{
			retSql =  sql.toString();
		}
		return retSql.replaceAll("@", "'");
	}
	
	/**
	 * ???????????????JSON2MV??????
	 */
	public MVContext json2MVByPortal(JSONObject tableJson, JSONArray kpiJson, JSONArray params, JSONArray pageParams) throws Exception{
		TableSqlJsonVO sqlVO = TableJsonService.json2TableSql(tableJson, kpiJson);
		
		//??????MV
		MVContext mv = new MVContextImpl();
		mv.setChildren(new ArrayList());
		String formId = ExtConstants.formIdPrefix + IdCreater.create();
		mv.setFormId(formId);
		mv.setMvid(deftMvId);
		
		//????????????,???????????????hidden
		parserHiddenParam(pageParams, mv, this.mvParams);
		
		
		//??????kpiOther
		CrossKpi mybaseKpi = null;
		JSONArray colsStr = tableJson.getJSONArray("cols");
		if(colsStr.size() == 0 || sqlVO.getKpis().size() == 0 || sqlVO.getKpis().size() > 1){
			JSONObject obj = new JSONObject();
			obj.put("type", "kpiOther");
			obj.put("id", "kpi");
			colsStr.add(obj);
		}else{
			//?????????????????????????????????????????????????????????baseKpi
			KpiInfo kpi = sqlVO.getKpis().get(0);
			CrossKpi baseKpi = new BaseKpiField();
			baseKpi.setAggregation(kpi.getAggre());
			baseKpi.setAlias(kpi.getAlias());
			baseKpi.setFormatPattern(kpi.getFmt());
			baseKpi.setKpiRate(kpi.getRate() == null ? null : new BigDecimal(kpi.getRate()));
			mybaseKpi = baseKpi;
		}
		
		//??????corssReport
		CrossReportContext cr = jsonService.json2Table(tableJson, sqlVO);
		if(mybaseKpi != null){
			cr.setBaseKpi(mybaseKpi);
		}
		//??????ID
		String id = ExtConstants.reportIdPrefix + IdCreater.create();
		cr.setId(id);
		String lock = (String)tableJson.get("lockhead");
		if("true".equals(lock)){
			cr.setOut("lockUI");
		}else{
			cr.setOut("HTML");
		}
		String height =  (String)tableJson.get("height");
		if(height != null && height.length() > 0){
			cr.setHeight(height);
		}
		cr.setShowData(true);
		
		//??????datacenter
		String sql = this.createSql(sqlVO,  params, 0, 0);
		GridDataCenterContext dc = this.createDataCenter(sql, sqlVO);
		cr.setRefDataCetner(dc.getId());
		if(mv.getGridDataCenters() == null){
			mv.setGridDataCenters(new HashMap<String, GridDataCenterContext>());
		}
		mv.getGridDataCenters().put(dc.getId(), dc);
		
		//????????????????????????
		List<RowDimContext> drillDims = cr.getDims();
		for(int i=0; drillDims!=null&&i<drillDims.size(); i++){
			RowDimContext drillDim = drillDims.get(i);
			//??????????????????DataCenter
			sql = this.createSql(sqlVO, params, 0, i+1);
			GridDataCenterContext drillDc = this.createDataCenter(sql, sqlVO);
			drillDim.setRefDataCenter(drillDc.getId());
			mv.getGridDataCenters().put(drillDc.getId(), drillDc);
		}
		
		mv.getChildren().add(cr);
		cr.setParent(mv);
		
		//????????????????????????????????????????????????
		JSONObject linkAccept = sqlVO.getLinkAccept();
		if(linkAccept != null && !linkAccept.isNullObject() && !linkAccept.isEmpty()){
			//????????????
			TextFieldContext linkText = new TextFieldContextImpl();
			linkText.setType("hidden");
			linkText.setDefaultValue((String)linkAccept.get("dftval"));
			linkText.setId((String)linkAccept.get("col"));
			linkText.setShow(true);
			mv.getChildren().add(0, linkText);
			linkText.setParent(mv);
			this.mvParams.put(linkText.getId(), linkText);
			ExtContext.getInstance().putServiceParam(mv.getMvid(), linkText.getId(), linkText);
			mv.setShowForm(true);
		}
		
		Map crs = new HashMap();
		crs.put(cr.getId(), cr);
		mv.setCrossReports(crs);
		
		//??????scripts
		String scripts = jsonService.getScripts().toString();
		if(scripts.length() > 0){
			mv.setScripts(scripts);
		}
		//?????????
		String dsid = PortalPageService.createDsource(dsource, mv);
		dc.getConf().setRefDsource(dsid);
		return mv;
	}
	
	public static void parserHiddenParam(JSONArray params, MVContext mv, Map<String, InputField> mvParams) throws ExtConfigException{
		if(params != null){
			for(int i=0; i<params.size(); i++){
				JSONObject param = params.getJSONObject(i);
				TextFieldContext target = new TextFieldContextImpl();
				target.setId(param.getString("paramid"));
				String defvalue = (String)param.get("defvalue");
				String type = param.getString("type");
				String dtformat = (String)param.get("dtformat");
				if(("dateselect".equals(type) || "monthselect".equals(type) || "yearselect".equals(type) )&& "now".equals(defvalue)){
					defvalue = new SimpleDateFormat(dtformat).format(new Date());
				}
				target.setValue(defvalue);
				target.setType("hidden");
				mvParams.put(target.getId(), target);
				ExtContext.getInstance().putServiceParam(mv.getMvid(), target.getId(), target);
				
				mv.getChildren().add(target);
				target.setParent(mv);
			}
		}
	}
	
	
	/**
	 * ????????????datacenter
	 * @param sql
	 * @return
	 * @throws IOException
	 */
	public GridDataCenterContext createDataCenter(String sql, TableSqlJsonVO sqlVO) throws IOException{
		GridDataCenterContext ctx = new GridDataCenterContextImpl();
		GridSetConfContext conf = new GridSetConfContext();
		ctx.setConf(conf);
		ctx.setId("DC-" + IdCreater.create());
		String name = TemplateManager.getInstance().createTemplate(sql);
		ctx.getConf().setTemplateName(name);
		
		return ctx;
	}
	
	/**
	 * nodetype ??????????????????????????????????????????????????????????????????????????????????????????????????????SQL???????????????????????????where ?????? ????????? having ???
	 * @param params
	 * @param nodetype
	 * @return
	 */
	public static String dealCubeParams(JSONArray params, Map<String, String> tableAlias){
		StringBuffer sb = new StringBuffer("");
		for(int i=0; params != null && i<params.size(); i++){
			JSONObject param = params.getJSONObject(i);

			String col = param.getString("col");
			String type = param.getString("type");
			String val = (String)param.get("val");
			String val2 = (String)param.get("val2");
			String valuetype = param.getString("valuetype");
			String usetype = param.getString("usetype");
			String linkparam = (String)param.get("linkparam");
			String linkparam2 = (String)param.get("linkparam2");
			String tname = (String)param.get("tname");
			col = tableAlias.get(tname)+"." + col;  //????????????
			
			if(type.equals("like")){
				if(val != null){
					val = "%"+val+"%";
				}
				if(val2 != null){
					val2 = "%"+val2+"%";
				}
			}
			if("string".equals(valuetype)){
				if(val != null){
					if("in".equals(type)){  //in?????????????????????????????????????????????
						String[] vls = val.split(",");
						val = "";
						for(int j=0; j<vls.length; j++){
							val = val + "'" + vls[j] + "'";
							if(j != vls.length - 1){
								val = val + ",";
							}
						}
					}else{
						val = "'" + val + "'";
					}
				}
				if(val2 != null){
					val2 = "'" + val2 + "'";
				}
			}
			if(type.equals("between")){
				if(usetype.equals("gdz")){
					sb.append(" and " +  col + " " + type + " " + val + " and " + val2);
				}else{
					sb.append("#if([x]"+linkparam+" != '' && [x]"+linkparam2+" != '') ");
					sb.append(" and "  + col + " " + type + " " + ("string".equals(valuetype)?"'":"") + "[x]"+linkparam +("string".equals(valuetype)?"'":"") + " and " + ("string".equals(valuetype)?"'":"")+ "[x]"+linkparam2 + ("string".equals(valuetype)?"'":"") + " #end");
				}
			}else if(type.equals("in")){
				if(usetype.equals("gdz")){
					sb.append(" and " + col + " in (" + val + ")");
				}else{
					sb.append("#if([x]"+linkparam+" != '') ");
					sb.append(" and " + col + " in (" + "$extUtils.printVals([x]"+linkparam + ", '"+valuetype+"'))");
					sb.append("  #end");
				}
			}else{
				if(usetype.equals("gdz")){
					sb.append(" and " + col + " " + type + " " + val);
				}else{
					sb.append("#if([x]"+linkparam+" != '') ");
					sb.append(" and " + col + " "+type+" " + ("string".equals(valuetype) ? "'"+("like".equals(type)?"%":"")+""+"[x]"+linkparam+""+("like".equals(type)?"%":"")+"'":"[x]"+linkparam) + "");
					sb.append("  #end");
				}
			}
		}
		return sb.toString().replaceAll("\\[x\\]", "\\$");
	}

	public Map<String, InputField> getMvParams() {
		return mvParams;
	}

	public void setMvParams(Map<String, InputField> mvParams) {
		this.mvParams = mvParams;
	}

	public JSONObject getDset() {
		return dset;
	}

	public JSONObject getDsource() {
		return dsource;
	}

	public void setDset(JSONObject dset) {
		this.dset = dset;
	}

	public void setDsource(JSONObject dsource) {
		this.dsource = dsource;
	}
	
}
