// v1775061083 - cache bust
// app.js - 房屋与生活 完整应用逻辑
var CLOUD_KEY='fangwu_yushenghuo_cloud';
var currentUser=null;

function getCloud(){try{return JSON.parse(localStorage.getItem(CLOUD_KEY)||'{}')}catch(e){return {}}}
function setCloud(d){localStorage.setItem(CLOUD_KEY,JSON.stringify(d))}

window.addEventListener('load',function(){gp('home');
  setTimeout(function(){
    var ld=document.getElementById('ld');
    if(ld){ld.classList.add('out');setTimeout(function(){ld.style.display='none'},600)}
  },1200);
  var saved=localStorage.getItem('fangwu_current_user');
  if(saved){try{currentUser=JSON.parse(saved)}catch(e){}}
  renderHomeNews();
  renderFangchan();
  renderCars();
  renderXueche();
  renderAllNews();
  window.addEventListener('scroll',function(){
    var btn=document.getElementById('stb');
    if(btn)btn.classList.toggle('on',window.scrollY>400);
  });
});

function gp(page){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on')});
  var el=document.getElementById('pg-'+page);
  if(el)el.classList.add('on');
  window.scrollTo({top:0,behavior:'smooth'});
  document.querySelectorAll('.lk').forEach(function(a){a.classList.remove('on')});
  var map={home:0,fangchan:1,diandongche:2,xueche:3,news:4};
  var links=document.querySelectorAll('.lk');
  if(map[page]!==undefined&&links[map[page]])links[map[page]].classList.add('on');
}

function sm(id){document.getElementById(id).classList.add('on')}
function cm(id){document.getElementById(id).classList.remove('on')}

function doLogin(){
  var u=document.getElementById('loginUsername').value.trim();
  var p=document.getElementById('loginPwd').value;
  if(!u||!p){toast('请输入用户名和密码','er');return}
  var users=getCloud().users||{};
  var found=null;
  for(var k in users){
    if((users[k].name===u||users[k].phone===u)&&users[k].password===p){found=users[k];break}
  }
  if(!found){toast('用户名或密码错误','er');return}
  currentUser=found;
  localStorage.setItem('fangwu_current_user',JSON.stringify(found));
  cm('loginModal');
  toast('登录成功！欢迎回来，'+found.name,'ok');
  updateNavUser();
}

function doRegister(){
  var name=document.getElementById('regUsername').value.trim();
  var phone=document.getElementById('regPhone').value.trim();
  var pwd=document.getElementById('regPwd').value;
  if(!name||!phone||!pwd){toast('请填写完整信息','er');return}
  if(name.length<2){toast('用户名至少2个字符','er');return}
  if(!/^1[3-9]\d{9}$/.test(phone)){toast('请输入有效手机号','er');return}
  if(pwd.length<6){toast('密码至少6个字符','er');return}
  var cloud=getCloud();
  if(!cloud.users)cloud.users={};
  if(cloud.users[name]){toast('用户名已被注册','er');return}
  var newUser={name:name,phone:phone,password:pwd,regTime:new Date().toISOString(),status:'active'};
  cloud.users[name]=newUser;
  setCloud(cloud);
  currentUser=newUser;
  localStorage.setItem('fangwu_current_user',JSON.stringify(newUser));
  cm('registerModal');
  toast('注册成功！欢迎加入，'+name,'ok');
  updateNavUser();
}

function updateNavUser(){
  var btn=document.getElementById('navLoginBtn');
  if(btn&&currentUser){btn.textContent='👤 '+currentUser.name;btn.onclick=function(){toast('已登录：'+currentUser.name)}}
}

function adminLogin(){
  var u=document.getElementById('adminUser').value;
  var p=document.getElementById('adminPwd').value;
  if(u==='admin'&&p==='admin123'){
    localStorage.setItem('fangwu_admin','1');
    gp('admin');
    toast('Login successful!','ok');
    loadAdminData();
  }else{toast('账号或密码错误','er')}
}

function adminLogout(){localStorage.removeItem('fangwu_admin');gp('home');toast('已退出登录','ok')}

function loadAdminData(){
  var cloud=getCloud();
  var users=cloud.users||{};
  var arr=Object.values(users);
  var el=document.getElementById('statUsers');
  if(el)el.textContent=arr.length;
  var el2=document.getElementById('statFangchan');
  if(el2)el2.textContent=LOU_PAN.length+ERSHOU.length;
  var el3=document.getElementById('statCar');
  if(el3)el3.textContent=CAR_DATA.length;
  var el4=document.getElementById('statXueche');
  if(el4)el4.textContent=XUECHE_DATA.length;
  var tbody=document.getElementById('usersTableBody');
  if(tbody){
    var html='';
    arr.forEach(function(u,i){
      html+='<tr><td>'+(i+1)+'</td><td>'+u.name+'</td><td>'+(u.phone||'')+'</td><td>'+(u.regTime?new Date(u.regTime).toLocaleDateString():'')+'</td><td><span class="bdg gr">正常</span></td><td><button class="btn btn-sm btn-rd" onclick="delUser(\''+u.name+'\')">删除</button></td></tr>';
    });
    tbody.innerHTML=html||'<tr><td colspan="6" style="text-align:center;color:var(--t3)">暂无用户</td></tr>';
  }
  var ftbody=document.getElementById('fangchanTableBody');
  if(ftbody){
    var fh='';
    LOU_PAN.slice(0,20).forEach(function(l,i){
      fh+='<tr><td>'+(i+1)+'</td><td>'+l.name+'</td><td>'+l.district+'</td><td>楼盘</td><td>'+l.price+'元/平</td><td>'+l.date+'</td><td><button class="btn btn-sm btn-rd">删除</button></td></tr>';
    });
    ftbody.innerHTML=fh;
  }
}

function adminTab(tab){
  document.querySelectorAll('.admin-panel').forEach(function(p){p.style.display='none'});
  document.querySelectorAll('.mi2').forEach(function(m){m.classList.remove('on')});
  if(event&&event.currentTarget)event.currentTarget.classList.add('on');
  var el=document.getElementById('admin-'+tab);
  if(el)el.style.display='block';
  if(tab==='users'||tab==='fangchan')loadAdminData();
}

function delUser(name){
  if(!confirm('确定删除用户 '+name+'？'))return;
  var cloud=getCloud();
  delete cloud.users[name];
  setCloud(cloud);
  loadAdminData();
  toast('用户已删除','ok');
}

function addUser(){
  var name=document.getElementById('addUserName').value.trim();
  var phone=document.getElementById('addUserPhone').value.trim();
  var pwd=document.getElementById('addUserPwd').value||'123456';
  if(!name||!phone){toast('请填写用户名和手机号','er');return}
  var cloud=getCloud();
  if(!cloud.users)cloud.users={};
  if(cloud.users[name]){toast('用户名已存在','er');return}
  cloud.users[name]={name:name,phone:phone,password:pwd,regTime:new Date().toISOString(),status:'active'};
  setCloud(cloud);
  cm('addUserModal');
  loadAdminData();
  toast('用户添加成功！','ok');
}

function submitProperty(){
  var name=document.getElementById('propName').value.trim();
  var district=document.getElementById('propDistrict').value;
  var price=document.getElementById('propPrice').value;
  if(!name||!district||!price){toast('请填写必填项','er');return}
  var item={id:'lp'+Date.now(),name:name,district:district,price:parseFloat(price),wy:parseFloat(document.getElementById('propWY').value)||0,tc:parseFloat(document.getElementById('propTC').value)||0,xq:document.getElementById('propXQ').value||'',date:new Date().toLocaleDateString(),views:0,desc:document.getElementById('propDesc').value||''};
  LOU_PAN.unshift(item);
  cm('addPropertyModal');
  toast('楼盘发布成功！','ok');
  renderFangchan();
}

function submitCar(){
  var name=document.getElementById('carName').value.trim();
  var brand=document.getElementById('carBrand').value;
  var price=document.getElementById('carPrice').value;
  if(!name||!brand||!price){toast('请填写必填项','er');return}
  var item={id:'car'+Date.now(),name:name,brand:brand,district:document.getElementById('carDistrict').value||'龙华区',price:parseFloat(price),type:document.getElementById('carType').value||'新能源电车',date:new Date().toLocaleDateString(),views:0,desc:document.getElementById('carDesc').value||''};
  CAR_DATA.unshift(item);
  cm('addCarModal');
  toast('车辆信息发布成功！','ok');
  renderCars();
}

function renderFangchan(district){
  var grid=document.getElementById('fangchanGrid');
  if(!grid)return;
  var data=district&&district!=='all'?LOU_PAN.filter(function(l){return l.district===district}):LOU_PAN;
  var html='';
  data.slice(0,12).forEach(function(item){
    html+='<div class="crd" onclick="toast(\'详情请致电: 13876699053\')">'
      +'<div class="ci">&#127968;</div>'
      +'<div class="cb"><span class="ctag">'+item.district+'</span>'
      +'<div class="ct">'+item.name+'</div>'
      +'<div class="cm"><span>&#127979; '+item.xq+'</span><span>&#128176; '+item.wy+'元/平</span><span>&#128663; '+item.tc+'元/月</span></div>'
      +'<div class="cp">'+item.price+'<small>元/平</small></div></div>'
      +'<div class="cf"><span><i class="fas fa-clock"></i> '+item.date+'</span><span><i class="fas fa-eye"></i> '+item.views+'</span></div></div>';
  });
  grid.innerHTML=html||'<div style="text-align:center;color:var(--t3);padding:40px">暂无数据</div>';
}

function renderErshou(district){
  var grid=document.getElementById('ershouGrid');
  if(!grid)return;
  var data=district&&district!=='all'?ERSHOU.filter(function(e){return e.district===district}):ERSHOU;
  var html='';
  data.slice(0,12).forEach(function(item){
    html+='<div class="crd" onclick="showDetail(\'ershou\',\''+item.id+'\')">'+
      '<div class="ci">&#127968;</div>'+
      '<div class="cb"><span class="ctag">'+item.district+'</span>'+
      '<div class="ct">'+item.name+'</div>'+
      '<div class="cm"><span>&#128207; '+item.area+'</span><span>&#128176; '+item.wy+'</span></div>'+
      '<div class="cp">'+item.price+'<small>万</small></div></div>'+
      '<div class="cf"><span>'+item.date+'</span><span>'+item.views+'</span></div></div>';
  });
  grid.innerHTML=html||'<div style="text-align:center;color:var(--t3);padding:40px">暂无数据</div>';
}

function renderPolicy(){
  var list=document.getElementById('policyList');
  if(!list)return;
  var html='';
  FANGCHAN_POLICY.slice(0,15).forEach(function(p){
    html+='<div class="pi"><div class="pic">&#128218;</div><div class="pc">'
      +'<div class="pct">'+p.title+'</div>'
      +'<div class="pcd">'+p.content+'</div>'
      +'<div class="pd"><i class="fas fa-building"></i> '+p.source+' &middot; '+p.date+' &middot; <i class="fas fa-eye"></i> '+p.views+' 阅读</div>'
      +'</div></div>';
  });
  list.innerHTML=html;
}

function renderCars(district){
  var grid=document.getElementById('carGrid');
  if(!grid)return;
  var data=district&&district!=='all'?CAR_DATA.filter(function(c){return c.district===district}):CAR_DATA;
  var html='';
  data.slice(0,12).forEach(function(c){
    html+='<div class="crd" onclick="showDetail(\'car\',\''+c.id+'\')">'+
      '<div class="ci" style="font-size:48px">&#128663;</div>'+
      '<div class="cb"><span class="ctag">'+c.district+'</span>'+
      '<div class="ct">'+c.name+'</div>'+
      '<div class="cm"><span>'+c.brand+'</span><span>'+c.type+'</span></div>'+
      '<div class="cp">'+c.price+'<small>万</small></div></div>'+
      '<div class="cf"><span>'+c.date+'</span><span>'+c.views+'</span></div></div>';
  });
  grid.innerHTML=html||'<div style="text-align:center;color:var(--t3);padding:40px">暂无数据</div>';
}

function renderXueche(){
  var grid=document.getElementById('xuecheGrid');
  if(!grid)return;
  var feats=[
    {fi:'&#128666;',ttl:'平台政策咨询',d:'滴滴、高德、美团、曹操最新政策解读'},
    {fi:'&#128104;',ttl:'从业资格培训',d:'网约车从业资格证报名、培训、拿证一站式服务'},
    {fi:'&#128663;',ttl:'新能源车购车',d:'与4S店合作，专享团购价，贷款优惠'},
    {fi:'&#128086;',ttl:'租车服务',d:'多种车型可选，月租低至2800元，含保险'},
    {fi:'&#128275;',ttl:'合规运营指导',d:'违规处理、证件办理、平台规则全解答'},
    {fi:'&#128172;',ttl:'老司机交流',d:'加入司机社群，共享接单技巧'},
  ];
  var html='';
  feats.forEach(function(f){
    html+='<div class="ft"><div class="fi">'+f.fi+'</div><div class="ct">'+f.ttl+'</div><div class="desc">'+f.d+'</div></div>';
  });
  grid.innerHTML=html;
  var list=document.getElementById('xuecheList');
  if(!list)return;
  var lh='';
  XUECHE_DATA.slice(0,10).forEach(function(x){
    lh+='<div class="ni"><div class="nim">&#128661;</div><div class="nc">'
      +'<div class="nt">'+x.title+'</div>'
      +'<div class="nm"><span>'+x.date+'</span><span class="tag">平台政策</span><span><i class="fas fa-eye"></i> '+x.views+'</span></div>'
      +'</div></div>';
  });
  list.innerHTML=lh;
}

function renderHomeNews(){
  var list=document.getElementById('homeNewsList');
  if(!list)return;
  var html='';
  FANGCHAN_POLICY.slice(0,5).forEach(function(p){
    html+='<div class="ni"><div class="nim">&#127968;</div><div class="nc">'
      +'<div class="nt">'+p.title+'</div>'
      +'<div class="nm"><span>'+p.date+'</span><span class="tag">'+p.source+'</span><span><i class="fas fa-eye"></i> '+p.views+'</span></div>'
      +'</div></div>';
  });
  list.innerHTML=html;
}

function renderAllNews(type){
  var list=document.getElementById('allNewsList');
  if(!list)return;
  var data=[];
  if(!type||type==='all'){
    data=FANGCHAN_POLICY.concat(XUECHE_DATA);
  }else if(type==='fangchan'){
    data=FANGCHAN_POLICY;
  }else if(type==='car'){
    data=CAR_DATA.map(function(c){return {title:c.name+' - '+c.desc,date:c.date,views:c.views,source:c.brand}});
  }else if(type==='xueche'){
    data=XUECHE_DATA;
  }
  var html='';
  data.slice(0,30).forEach(function(item){
    html+='<div class="ni"><div class="nim">&#128240;</div><div class="nc">'
      +'<div class="nt">'+(item.title||item.name||'')+'</div>'
      +'<div class="nm"><span>'+(item.date||'')+'</span><span class="tag">'+(item.source||'资讯')+'</span><span><i class="fas fa-eye"></i> '+(item.views||0)+'</span></div>'
      +'</div></div>';
  });
  list.innerHTML=html;
}

function switchFangchanTab(tab,el){
  document.querySelectorAll('#fangchanTabs .tab').forEach(function(t){t.classList.remove('on')});
  if(el)el.classList.add('on');
  var grids=['fangchanGrid','ershouGrid','policyList','gossipList'];
  grids.forEach(function(g){var e=document.getElementById(g);if(e)e.style.display='none'});
  if(tab==='loupan'){var e=document.getElementById('fangchanGrid');if(e){e.style.display='grid';renderFangchan()}}
  else if(tab==='ershou'){var e=document.getElementById('ershouGrid');if(e){e.style.display='grid';renderErshou()}}
  else if(tab==='policy'){var e=document.getElementById('policyList');if(e){e.style.display='flex';renderPolicy()}}
  else if(tab==='gossip'){var e=document.getElementById('gossipList');if(e){e.style.display='flex';renderGossip()}}
}

function renderGossip(){
  var list=document.getElementById('gossipList');
  if(!list)return;
  var gossips=[
    {title:'龙华区某楼盘烂尾？官方辟谣：已重组复工',date:'2026-03-28',views:1567},
    {title:'海口二手房交易新套路：低评估价避税风险大',date:'2026-03-26',views:1234},
    {title:'某中介公司卷款跑路，受害者已报案',date:'2026-03-24',views:2345},
    {title:'购房合同陷阱：这些条款要注意',date:'2026-03-22',views:987},
    {title:'海口部分区域房价或将迎来调整',date:'2026-03-20',views:1567},
    {title:'女子买二手房遇凶宅，状告原房东',date:'2026-03-18',views:3456},
    {title:'购房定金能退吗？这些情况可以！',date:'2026-03-15',views:1234},
    {title:'海口多个小区物业费涨价遭业主抵制',date:'2026-03-12',views:876},
    {title:'房产证迟迟办不下来？可能是这些问题',date:'2026-03-10',views:1456},
    {title:'海口学区房骗局：名校名额是假的',date:'2026-03-08',views:2876},
  ];
  var html='';
  gossips.forEach(function(g){
    html+='<div class="pi"><div class="pic">&#128680;</div><div class="pc">'
      +'<div class="pct">'+g.title+'</div>'
      +'<div class="pd">'+g.date+' &middot; <i class="fas fa-eye"></i> '+g.views+' 阅读</div>'
      +'</div></div>';
  });
  list.innerHTML=html;
}

function switchDistrict(page,district,el){
  var container=document.getElementById(page+'Districts');
  if(container)container.querySelectorAll('.db2').forEach(function(b){b.classList.remove('on')});
  if(el)el.classList.add('on');
  if(page==='fangchan')renderFangchan(district);
  else if(page==='ershou')renderErshou(district);
  else if(page==='car')renderCars(district);
}

function switchNewsTab(type,el){
  document.querySelectorAll('#newsTabs .tab').forEach(function(t){t.classList.remove('on')});
  if(el)el.classList.add('on');
  renderAllNews(type);
}

function toast(msg,type){
  type=type||'ok';
  var container=document.getElementById('tc');
  if(!container)return;
  var t=document.createElement('div');
  t.className='tost '+type;
  var icons={ok:'fa-check-circle',er:'fa-times-circle',wr:'fa-exclamation-circle'};
  t.innerHTML='<i class="fas '+(icons[type]||'fa-info-circle')+' ic"></i><span>'+msg+'</span>';
  container.appendChild(t);
  setTimeout(function(){t.style.opacity='0';t.style.transform='translateX(100%)';setTimeout(function(){t.remove()},300)},3000);
}


// ====== DETAIL MODAL FUNCTIONS ======
function showDetail(type, id){
  var data = null;
  if(type === 'loupan'){
    data = LOU_PAN.find(function(x){return x.id === id});
  }else if(type === 'ershou'){
    data = ERSHOU.find(function(x){return x.id === id});
  }else if(type === 'policy'){
    data = FANGCHAN_POLICY.find(function(x){return x.id === id});
  }else if(type === 'car'){
    data = CAR_DATA.find(function(x){return x.id === id});
  }else if(type === 'xueche'){
    data = XUECHE_DATA.find(function(x){return x.id === id});
  }
  if(!data){toast('Data not found','er');return;}
  var modal = document.getElementById('detailModal');
  var content = document.getElementById('detailContent');
  var name = data.name || data.title || 'Details';
  var html = '<div class="detail-header"><h2>'+name+'</h2></div><div class="detail-body">';
  html += '<div class="detail-img"><img src="https://picsum.photos/800/400?random='+Math.random()+'" alt="Image"></div>';
  
  if(type === 'loupan' || type === 'ershou'){
    html += '<div class="detail-info">';
    html += '<div class="di-row"><span class="di-label">Region:</span><span class="di-value">'+(data.district||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Price:</span><span class="di-value">'+(data.price||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Property Fee:</span><span class="di-value">'+(data.wy||'-')+' yuan/month</span></div>';
    html += '<div class="di-row"><span class="di-label">Parking:</span><span class="di-value">'+(data.tc||'-')+' yuan/month</span></div>';
    html += '<div class="di-row"><span class="di-label">School District:</span><span class="di-value">'+(data.xq||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Date:</span><span class="di-value">'+(data.date||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Views:</span><span class="di-value">'+(data.views||'-')+'</span></div>';
    html += '</div>';
    html += '<div class="detail-desc"><h3>Description</h3><p>'+(data.desc||'No description available.')+'</p></div>';
  }else if(type === 'policy'){
    html += '<div class="detail-info">';
    html += '<div class="di-row"><span class="di-label">Source:</span><span class="di-value">'+(data.source||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Date:</span><span class="di-value">'+(data.date||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Views:</span><span class="di-value">'+(data.views||'-')+'</span></div>';
    html += '</div>';
    html += '<div class="detail-desc"><h3>Policy Content</h3><p>'+(data.content||'No content available.')+'</p></div>';
  }else if(type === 'car'){
    html += '<div class="detail-info">';
    html += '<div class="di-row"><span class="di-label">Brand:</span><span class="di-value">'+(data.brand||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Region:</span><span class="di-value">'+(data.district||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Price:</span><span class="di-value">'+(data.price||'-')+' 万</span></div>';
    html += '<div class="di-row"><span class="di-label">Type:</span><span class="di-value">'+(data.type||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Date:</span><span class="di-value">'+(data.date||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Views:</span><span class="di-value">'+(data.views||'-')+'</span></div>';
    html += '</div>';
    html += '<div class="detail-desc"><h3>Description</h3><p>'+(data.desc||'No description available.')+'</p></div>';
  }else if(type === 'xueche'){
    html += '<div class="detail-info">';
    html += '<div class="di-row"><span class="di-label">Date:</span><span class="di-value">'+(data.date||'-')+'</span></div>';
    html += '<div class="di-row"><span class="di-label">Views:</span><span class="di-value">'+(data.views||'-')+'</span></div>';
    html += '</div>';
    html += '<div class="detail-desc"><h3>Content</h3><p>'+(data.content||data.title||'No content available.')+'</p></div>';
  }
  html += '<div class="detail-contact"><h3>Contact Us</h3><p>Phone: 13876699053</p></div>';
  html += '</div>';
  content.innerHTML = html;
  modal.classList.add('on');
}

function closeDetail(){
  document.getElementById('detailModal').classList.remove('on');
}
// END OF APP.JS

// ===== 用户系统 =====
var USERS_KEY = 'fangwu_users';
var CUR_USER_KEY = 'fangwu_cur_user';

function getUsers(){
  try{ return JSON.parse(localStorage.getItem(USERS_KEY)||'{}'); }catch(e){ return {}; }
}

function saveUsers(u){
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

function getCurUser(){
  try{ return JSON.parse(localStorage.getItem(CUR_USER_KEY)||'null'); }catch(e){ return null; }
}

function doRegister(){
  var u = document.getElementById('regUsername').value.trim();
  var p = document.getElementById('regPwd').value;
  var ph = document.getElementById('regPhone').value.trim();
  if(!u||!p||!ph){ toast('请填写完整信息','er'); return; }
  if(p.length < 6){ toast('密码至少6位','er'); return; }
  var users = getUsers();
  if(users[u]){ toast('用户名已存在','er'); return; }
  users[u] = {pwd:p, phone:ph, date:new Date().toISOString().split('T')[0]};
  saveUsers(users);
  toast('注册成功！请登录','ok');
  cm('registerModal');
  sm('loginModal');
}

function doLogin(){
  var u = document.getElementById('loginUsername').value.trim();
  var p = document.getElementById('loginPwd').value;
  var users = getUsers();
  if(users[u] && users[u].pwd === p){
    localStorage.setItem(CUR_USER_KEY, JSON.stringify({name:u, phone:users[u].phone}));
    cm('loginModal');
    updateNavUser();
    toast('登录成功！欢迎 '+u,'ok');
  } else {
    toast('用户名或密码错误','er');
  }
}

function doLogout(){
  localStorage.removeItem(CUR_USER_KEY);
  updateNavUser();
  gp('home');
  toast('已退出登录','ok');
}

function updateNavUser(){
  var cur = getCurUser();
  var btn = document.getElementById('navUserBtn');
  if(!btn) return;
  if(cur){
    btn.textContent = cur.name;
    btn.onclick = function(){ gp('profile'); };
  } else {
    btn.textContent = '登录';
    btn.onclick = function(){ sm('loginModal'); };
  }
}

// ===== 管理后台 =====
function renderAdmin(){
  if(localStorage.getItem('fangwu_admin') !== '1'){
    sm('adminLoginModal');
    return '<div class="admin-box"><h2>管理后台</h2><p>请先登录管理账号</p></div>';
  }
  var users = getUsers();
  var userRows = '';
  for(var k in users){
    userRows += '<tr><td>'+k+'</td><td>'+users[k].phone+'</td><td>'+users[k].date+'</td><td><button class="btn-sm" onclick="delUser(\''+k+'\')">删除</button></td></tr>';
  }
  return '<div class="admin-box">'+
    '<h2>🏠 管理后台</h2>'+
    '<div class="stat-grid">'+
    '<div class="stat-card"><h3>注册用户</h3><p>'+Object.keys(users).length+'</p></div>'+
    '<div class="stat-card"><h3>楼盘信息</h3><p>'+LOU_PAN.length+'</p></div>'+
    '<div class="stat-card"><h3>二手房</h3><p>'+ERSHOU.length+'</p></div>'+
    '<div class="stat-card"><h3>汽车信息</h3><p>'+CAR_DATA.length+'</p></div>'+
    '</div>'+
    '<h3>用户管理</h3>'+
    '<table class="admin-table"><thead><tr><th>用户名</th><th>手机</th><th>注册日期</th><th>操作</th></tr></thead>'+
    '<tbody>'+(userRows||'<tr><td colspan=4 style=text-align:center>暂无注册用户</td></tr>')+'</tbody></table>'+
    '<h3>数据管理</h3>'+
    '<div class="btn-group">'+
    '<button class="btn" onclick="addLoupan()">+ 添加楼盘</button>'+
    '<button class="btn" onclick="addErshou()">+ 添加房源</button>'+
    '<button class="btn" onclick="addCar()">+ 添加车型</button>'+
    '<button class="btn btn-outline" onclick="adminLogout()">退出管理</button>'+
    '</div></div>';
}

function delUser(name){
  if(!confirm('确定删除用户 '+name+' ?')) return;
  var users = getUsers();
  delete users[name];
  saveUsers(users);
  gp('admin');
  toast('用户已删除','ok');
}

function addLoupan(){
  var name = prompt('楼盘名称:');
  if(!name) return;
  var district = prompt('区域(龙华区/秀英区/美兰区/琼山区):','龙华区');
  var price = parseInt(prompt('单价(元/平):','20000'));
  LOU_PAN.push({id:'lp'+(LOU_PAN.length+1),name:name,district:district,price:price,wy:3.0,tc:400,xq:'海口中学',date:new Date().toISOString().split('T')[0],views:0,desc:'新增楼盘'});
  toast('楼盘添加成功','ok');
  gp('fangchan');
}

function addErshou(){
  var name = prompt('房源名称:');
  if(!name) return;
  var district = prompt('区域:','龙华区');
  var price = parseInt(prompt('总价(万):','100'));
  ERSHOU.push({id:'es'+(ERSHOU.length+1),name:name,district:district,price:price,area:'100平',wy:3.0,tc:400,date:new Date().toISOString().split('T')[0],views:0,desc:'新增房源'});
  toast('房源添加成功','ok');
  gp('fangchan');
}

function addCar(){
  var name = prompt('车型名称:');
  if(!name) return;
  var brand = prompt('品牌:','比亚迪');
  var price = parseFloat(prompt('价格(万):','15'));
  CAR_DATA.push({id:'car'+(CAR_DATA.length+1),name:name,brand:brand,district:'龙华区',price:price,type:'新能源电车',date:new Date().toISOString().split('T')[0],views:0,desc:'新增车型'});
  toast('车型添加成功','ok');
  gp('diandongche');
}

// ===== 个人中心 =====
function renderProfile(){
  var cur = getCurUser();
  if(!cur){ sm('loginModal'); return '<div class="admin-box"><h2>个人中心</h2><p>请先登录</p></div>'; }
  return '<div class="admin-box">'+
    '<h2>👤 个人中心</h2>'+
    '<p><strong>用户名：</strong>'+cur.name+'</p>'+
    '<p><strong>手机号：</strong>'+cur.phone+'</p>'+
    '<button class="btn btn-outline" onclick="doLogout()">退出登录</button>'+
    '</div>';
}

// 初始化
window.addEventListener('DOMContentLoaded', function(){
  updateNavUser();
});
