package com.ruisi.vdop.web.frame;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ruisi.ext.engine.dao.DaoHelper;
import com.ruisi.ext.engine.init.XmlParser;
import com.ruisi.ext.engine.view.context.ExtContext;
import com.ruisi.ispire.dc.grid.GridDataUtils;
import com.ruisi.vdop.bean.User;
import com.ruisi.vdop.util.VDOPUtils;

public class Frame3Action {
	
	private DaoHelper daoHelper;
	private String userId;

	public String execute() {
		User u = VDOPUtils.getLoginedUser();
		VDOPUtils.getRequest().setAttribute("uinfo", u);
		userId = u.getUserId();
		//查询所有菜单
		List menuList = daoHelper.getSqlMapClientTemplate().queryForList("vdop.frame.frame.menus", this);
		List roots = this.findMenuChildren(0, menuList);
		for(int i=0; i<roots.size(); i++){
			Map root = (Map)roots.get(i);
			Double id = GridDataUtils.getKpiData(root, "menu_id");
			root.put("children", findMenuChildren(id, menuList));
		}
		VDOPUtils.getRequest().setAttribute("menu", roots);
		
		return "success";
	}
	
	private List findMenuChildren(double pid, List menuList){
		List ret = new ArrayList();
		for(int i=0; i<menuList.size(); i++){
			Map m = (Map)menuList.get(i);
			Double value = GridDataUtils.getKpiData(m, "pid");
			if(value != null && value.equals(pid) ){
				ret.add(m);
			}
		}
		return ret;
	}
	
	public String welcome() {
		return "welcome";
	}
	
	public String onlineUser() throws IOException{
		
		return null;
	}
	
	public String syspage(){
		return "syspage";
	}

	public DaoHelper getDaoHelper() {
		return daoHelper;
	}

	public void setDaoHelper(DaoHelper daoHelper) {
		this.daoHelper = daoHelper;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}
	
}
