// @ts-nocheck
// Contracts tool (ported from realtors-panama-contratos.jsx). Admin only.
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "@/lib/store";
import { listContracts, saveContract, deleteContract, getSetting, setSetting } from "@/lib/contracts";
import { locationName } from "@/lib/locations";

const LOGO = "/brand/icon.png";

const C={navy:"#111111",navyL:"#1C1C1C",navyM:"#2A2A2A",gold:"#C8A951",goldL:"#E8D9A0",
  g50:"#FAFBFC",g100:"#F1F3F5",g200:"#DEE2E6",g400:"#ADB5BD",g500:"#868E96",g600:"#5C636A",
  green:"#27AE60",red:"#C0392B",blue:"#2980B9"};

const today=new Date();
const fmtDate=d=>{const m=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];return`${d.getDate()} de ${m[d.getMonth()]} de ${d.getFullYear()}`;};
const provinces=["Bocas del Toro","Chiriquí","Coclé","Colón","Darién","Herrera","Los Santos","Panamá","Panamá Oeste","Veraguas","Comarca Guna Yala","Comarca Emberá-Wounaan","Comarca Ngäbe-Buglé"];
const propTypes=[{v:"casa",l:"Casa"},{v:"apartamento",l:"Apartamento"},{v:"terreno",l:"Terreno"},{v:"local_comercial",l:"Local Comercial"},{v:"oficina",l:"Oficina"},{v:"finca",l:"Finca"},{v:"bodega",l:"Bodega"},{v:"otro",l:"Otro"}];

const blankParty={name:"",id:"",phone:"",email:"",address:"",photo:null};
const blankBroker={...blankParty,license:"",licensePhoto:null};
const initForm={broker:{...blankBroker},owner:{...blankParty},buyer:{...blankParty},tenant:{...blankParty},
  property:{type:"casa",address:"",province:"Panamá",district:"",corregimiento:"",finca:"",tomo:"",folio:"",area:"",description:""},
  contract:{type:"venta",salePrice:"",rentalPrice:"",commSale:"5",commRental:"100",exclusivity:"exclusiva",duration:"6",date:fmtDate(today),
    additionalTerms:"",deposit:"",rentalDuration:"12",payDay:"1",startDate:"",endDate:"",penaltyEarly:"",lateFeePct:"5",promiseDeadline:"90",promiseDeposit:"10"},
};

/* ─── SHARED UI ─── */
const lbl={fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3,display:"block"};
const inpS={width:"100%",boxSizing:"border-box",padding:"9px 12px",border:`1px solid ${C.g200}`,borderRadius:6,fontSize:13,fontFamily:"'Inter Tight',sans-serif",outline:"none"};
function Inp({label,value,onChange,placeholder,type="text",full,...r}){
  return(<div style={full?{gridColumn:"1/-1"}:{}}><label style={lbl}>{label}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inpS}
      onFocus={e=>e.target.style.borderColor=C.navy} onBlur={e=>e.target.style.borderColor=C.g200} {...r}/></div>);
}
function Sel({label,value,onChange,options,full}){
  return(<div style={full?{gridColumn:"1/-1"}:{}}><label style={lbl}>{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)} style={{...inpS,background:"#fff",cursor:"pointer"}}>
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select></div>);
}
function Txa({label,value,onChange,placeholder,rows=3,full}){
  return(<div style={full?{gridColumn:"1/-1"}:{}}><label style={lbl}>{label}</label>
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{...inpS,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=C.navy} onBlur={e=>e.target.style.borderColor=C.g200}/></div>);
}
function Radio({label,value,onChange,options}){
  return(<div style={{gridColumn:"1/-1"}}><label style={lbl}>{label}</label>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
      {options.map(o=>(<label key={o.v} style={{display:"flex",alignItems:"center",cursor:"pointer",padding:"7px 16px",borderRadius:6,fontSize:12,fontWeight:600,
        background:value===o.v?C.navy:C.g100,color:value===o.v?"#fff":C.g600,border:`1px solid ${value===o.v?C.navy:C.g200}`,transition:"all .2s"}}>
        <input type="radio" value={o.v} checked={value===o.v} onChange={()=>onChange(o.v)} style={{display:"none"}}/>{o.l}</label>))}</div></div>);
}
function FileUp({label,value,onChange}){
  const ref=useRef();
  const handle=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onChange(ev.target.result);r.readAsDataURL(f);};
  return(<div><label style={lbl}>{label}</label>
    <div onClick={()=>ref.current.click()} style={{border:`2px dashed ${value?C.navy:C.g200}`,borderRadius:8,padding:value?0:18,cursor:"pointer",
      display:"flex",alignItems:"center",justifyContent:"center",minHeight:85,background:value?"transparent":C.g50,overflow:"hidden",position:"relative"}}>
      {value?(<><img src={value} alt="" style={{maxWidth:"100%",maxHeight:130,objectFit:"contain"}}/>
        <button onClick={e=>{e.stopPropagation();onChange(null);}} style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,.6)",color:"#fff",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></>
      ):(<div style={{textAlign:"center",color:C.g400}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.g400} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
        <div style={{fontSize:10,marginTop:2}}>Adjuntar</div></div>)}
      <input ref={ref} type="file" accept="image/*,.pdf" onChange={handle} style={{display:"none"}}/></div></div>);
}
function Sec({icon,title,children}){
  return(<div style={{marginBottom:22}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:7,borderBottom:`2px solid ${C.navy}`}}>
      <div style={{width:26,height:26,borderRadius:5,background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13}}>{icon}</div>
      <h3 style={{margin:0,fontSize:13,fontWeight:700,color:C.navy}}>{title}</h3></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{children}</div></div>);
}

/* ─── SIGNATURE PAD ─── */
function SignaturePad({label,signatureData,onSave,onClear}){
  const canvasRef=useRef(null);
  const [drawing,setDrawing]=useState(false);
  const [hasDrawn,setHasDrawn]=useState(false);

  const getPos=(e)=>{
    const r=canvasRef.current.getBoundingClientRect();
    const touch=e.touches?e.touches[0]:e;
    return{x:touch.clientX-r.left,y:touch.clientY-r.top};
  };
  const startDraw=(e)=>{e.preventDefault();setDrawing(true);setHasDrawn(true);
    const ctx=canvasRef.current.getContext("2d");const p=getPos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);};
  const draw=(e)=>{if(!drawing)return;e.preventDefault();
    const ctx=canvasRef.current.getContext("2d");const p=getPos(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle=C.navy;ctx.lineWidth=2;ctx.lineCap="round";ctx.stroke();};
  const stopDraw=()=>{if(drawing){setDrawing(false);onSave(canvasRef.current.toDataURL());}};
  const clear=()=>{const ctx=canvasRef.current.getContext("2d");ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);setHasDrawn(false);onClear();};

  return(
    <div style={{textAlign:"center"}}>
      <p style={{margin:"0 0 4px",fontSize:10,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</p>
      {signatureData?(
        <div style={{position:"relative",display:"inline-block"}}>
          <img src={signatureData} alt="Firma" style={{height:60,border:`1px solid ${C.g200}`,borderRadius:4}}/>
          <button onClick={clear} style={{position:"absolute",top:-6,right:-6,background:C.red,color:"#fff",border:"none",borderRadius:"50%",
            width:18,height:18,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          <p style={{margin:"3px 0 0",fontSize:9,color:C.green,fontWeight:600}}>✓ Firmado</p>
        </div>
      ):(
        <div>
          <canvas ref={canvasRef} width={220} height={70}
            style={{border:`1px dashed ${C.g400}`,borderRadius:6,cursor:"crosshair",touchAction:"none",background:"#fff"}}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}/>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:4}}>
            {hasDrawn&&<button onClick={clear} style={{fontSize:9,color:C.red,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Borrar</button>}
            <p style={{margin:0,fontSize:9,color:C.g400}}>Firme arriba con el mouse o dedo</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CONTRACT PARTS ─── */
function CHeader({title,subtitle}){
  return(<div style={{textAlign:"center",marginBottom:22,borderBottom:`3px solid ${C.navy}`,paddingBottom:14}}>
    <h1 style={{margin:0,fontSize:17,fontWeight:800,color:C.navy,letterSpacing:".08em",textTransform:"uppercase"}}>Realtors of Panama</h1>
    <p style={{margin:"2px 0 0",fontSize:9,color:C.g400,letterSpacing:".15em",textTransform:"uppercase"}}>Conectando Corredores · Transformando Propiedades</p>
    <h2 style={{margin:"12px 0 0",fontSize:14,fontWeight:700,color:C.navy,textTransform:"uppercase",letterSpacing:".05em"}}>{title}</h2>
    {subtitle&&<p style={{margin:"2px 0 0",fontSize:11,color:C.g500}}>{subtitle}</p>}</div>);
}
function CFooter(){
  return(<div style={{marginTop:24,textAlign:"center",borderTop:`2px solid ${C.navy}`,paddingTop:8}}>
    <p style={{margin:0,fontSize:9,color:C.navy,letterSpacing:".1em",fontWeight:700,textTransform:"uppercase"}}>Realtors of Panama</p></div>);
}
function InfoBox({children}){return <div style={{background:C.g50,borderRadius:6,padding:11,marginBottom:10,border:`1px solid ${C.g200}`,fontSize:12,lineHeight:1.6}}>{children}</div>;}
function PropBox({d}){
  const tl=propTypes.find(p=>p.v===d.type)?.l||d.type;
  return(<InfoBox>
    <p style={{margin:"0 0 2px"}}><strong>Tipo:</strong> {tl}</p>
    <p style={{margin:"0 0 2px"}}><strong>Ubicación:</strong> {d.address||"_______________"}, Corregimiento de {d.corregimiento||"_______"}, Distrito de {d.district||"_______"}, Provincia de {d.province}.</p>
    {(d.finca||d.tomo||d.folio)&&<p style={{margin:"0 0 2px"}}><strong>Registrales:</strong> Finca No. {d.finca||"___"}, Tomo {d.tomo||"___"}, Folio {d.folio||"___"} del Registro Público.</p>}
    {d.area&&<p style={{margin:"0 0 2px"}}><strong>Superficie:</strong> {d.area} m²</p>}
    {d.description&&<p style={{margin:0}}><strong>Descripción:</strong> {d.description}</p>}</InfoBox>);
}
function Annex({photos}){
  const items=photos.filter(p=>p.src);if(!items.length)return null;
  return(<div style={{marginTop:20,borderTop:`2px solid ${C.g200}`,paddingTop:12}}>
    <p style={{fontWeight:700,color:C.navy,margin:"0 0 8px",fontSize:11}}>ANEXOS — DOCUMENTOS DE IDENTIFICACIÓN</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
      {items.map((p,i)=>(<div key={i} style={{textAlign:"center"}}>
        <img src={p.src} alt="" style={{maxWidth:"100%",maxHeight:120,border:`1px solid ${C.g200}`,borderRadius:5}}/>
        <p style={{fontSize:9,color:C.g600,margin:"2px 0 0"}}>{p.label}</p></div>))}</div></div>);
}

/* ─── SIGN BLOCK WITH PADS ─── */
function SignBlock({parties,signatures,onSign,onClear,editMode,signType}){
  const isDigital = signType==="digital";
  return(<div style={{marginTop:32}}>
    <div style={{display:"grid",gridTemplateColumns:`repeat(${parties.length},1fr)`,gap:parties.length>2?16:28}}>
      {parties.map((p,i)=>(
        <div key={i} style={{textAlign:"center"}}>
          {isDigital && editMode?(
            <SignaturePad label={`Firma — ${p.r}`} signatureData={signatures[p.key]} onSave={d=>onSign(p.key,d)} onClear={()=>onClear(p.key)}/>
          ):isDigital && signatures[p.key]?(
            <div><img src={signatures[p.key]} alt="Firma" style={{height:50,marginBottom:2}}/><p style={{margin:0,fontSize:9,color:C.green,fontWeight:600}}>✓ Firmado</p></div>
          ):(
            <div style={{borderBottom:"1px solid #333",height:44,marginBottom:4}}/>
          )}
          <p style={{margin:"4px 0 0",fontWeight:700,fontSize:11}}>{p.n||p.r}</p>
          <p style={{margin:0,fontSize:9,color:C.g600}}>{p.s}</p>
          <p style={{margin:0,fontSize:9,color:C.g600}}>{p.r}</p>
        </div>
      ))}
    </div>
  </div>);
}

/* ═══ CONTRACT PREVIEWS ═══ */
function AuthPreview({d,signatures,onSign,onClear,editMode,signType}){
  const ct=d.contract,isV=ct.type==="venta",isA=ct.type==="alquiler",isB=ct.type==="ambos";
  const parties=[{key:"owner",n:d.owner.name,s:`Cédula: ${d.owner.id||"___"}`,r:"Propietario"},{key:"broker",n:d.broker.name,s:`Lic: ${d.broker.license||"___"}`,r:"Corredor de Bienes Raíces"}];
  return(<div style={{lineHeight:1.65,fontSize:12,color:"#000"}}>
    <CHeader title={`Contrato de Autorización ${isV?"de Venta":isA?"de Alquiler":"de Venta y Alquiler"}`} subtitle={ct.date}/>
    <InfoBox>
      <p style={{margin:"0 0 3px",fontWeight:700,color:C.navy}}>PARTES INTERVINIENTES</p>
      <p style={{margin:"0 0 2px"}}><strong>PROPIETARIO:</strong> {d.owner.name||"_______________"}, cédula No. {d.owner.id||"_________"}, domicilio: {d.owner.address||"_______________"}, tel. {d.owner.phone||"_________"}, correo: {d.owner.email||"___________"}.</p>
      <p style={{margin:0}}><strong>CORREDOR:</strong> {d.broker.name||"_______________"}, cédula No. {d.broker.id||"_________"}, Licencia No. {d.broker.license||"_________"} expedida por la Junta Técnica de Bienes Raíces de Panamá, tel. {d.broker.phone||"_________"}, correo: {d.broker.email||"___________"}.</p>
    </InfoBox>
    <p style={{fontWeight:700,color:C.navy,margin:"0 0 5px",fontSize:12}}>CLÁUSULAS</p>
    <p style={{margin:"0 0 7px"}}><strong>PRIMERA — OBJETO:</strong> EL PROPIETARIO autoriza al CORREDOR, de manera {ct.exclusivity==="exclusiva"?"EXCLUSIVA":"NO EXCLUSIVA"}, para gestionar la {isV?"venta":isA?"el alquiler":"la venta y/o alquiler"} del siguiente inmueble:</p>
    <PropBox d={d.property}/>
    <p style={{margin:"0 0 7px"}}><strong>SEGUNDA — PRECIO:</strong> {(isV||isB)&&<>Precio de venta: <strong>USD ${ct.salePrice||"_________"}</strong>. </>}{(isA||isB)&&<>Canon mensual: <strong>USD ${ct.rentalPrice||"_________"}</strong>. </>}Ajustable solo con autorización escrita del PROPIETARIO.</p>
    <p style={{margin:"0 0 7px"}}><strong>TERCERA — COMISIÓN:</strong> Al cierre exitoso: {(isV||isB)&&<><strong>{ct.commSale||"5"}%</strong> del precio de venta. </>}{(isA||isB)&&<><strong>{ct.commRental||"100"}%</strong> del primer mes. </>}Pagadera al CORREDOR directamente. Realtors of Panama actúa como plataforma de conexión, sin ser parte contractual.</p>
    <p style={{margin:"0 0 7px"}}><strong>CUARTA — VIGENCIA:</strong> <strong>{ct.duration||"6"} meses</strong> desde la firma. Renovable por acuerdo escrito. Terminable con 30 días de aviso.</p>
    {ct.exclusivity==="exclusiva"&&<p style={{margin:"0 0 7px"}}><strong>QUINTA — EXCLUSIVIDAD:</strong> EL PROPIETARIO no autorizará a terceros durante la vigencia. Si realiza transacción directa, pagará la comisión pactada.</p>}
    <p style={{margin:"0 0 7px"}}><strong>{ct.exclusivity==="exclusiva"?"SEXTA":"QUINTA"} — OBLIGACIONES DEL CORREDOR:</strong> Promocionar activamente; coordinar visitas; actuar con diligencia y buena fe; informar al propietario; cumplir la Ley 11 de 2010.</p>
    <p style={{margin:"0 0 7px"}}><strong>{ct.exclusivity==="exclusiva"?"SÉPTIMA":"SEXTA"} — OBLIGACIONES DEL PROPIETARIO:</strong> Declara ser legítimo propietario; inmueble libre de gravámenes; facilitará documentación; permitirá acceso para visitas.</p>
    <p style={{margin:"0 0 7px"}}><strong>{ct.exclusivity==="exclusiva"?"OCTAVA":"SÉPTIMA"} — LEGISLACIÓN:</strong> Ley 11 de 14 de abril de 2010. Controversias ante tribunales de Panamá.</p>
    {ct.additionalTerms&&<p style={{margin:"0 0 7px"}}><strong>TÉRMINOS ADICIONALES:</strong> {ct.additionalTerms}</p>}
    <SignBlock parties={parties} signatures={signatures} onSign={onSign} onClear={onClear} editMode={editMode} signType={signType}/>
    <Annex photos={[{src:d.broker.licensePhoto,label:"Licencia"},{src:d.broker.photo,label:"ID Corredor"},{src:d.owner.photo,label:"ID Propietario"}]}/>
    <CFooter/></div>);
}

function RentalPreview({d,signatures,onSign,onClear,editMode,signType}){
  const ct=d.contract;
  const parties=[{key:"owner",n:d.owner.name,s:`Cédula: ${d.owner.id||"___"}`,r:"Arrendador"},{key:"tenant",n:d.tenant.name,s:`Cédula: ${d.tenant.id||"___"}`,r:"Arrendatario"},{key:"broker",n:d.broker.name,s:`Lic: ${d.broker.license||"___"}`,r:"Corredor"}];
  return(<div style={{lineHeight:1.65,fontSize:12,color:"#000"}}>
    <CHeader title="Contrato de Arrendamiento" subtitle={ct.date}/>
    <InfoBox>
      <p style={{margin:"0 0 3px",fontWeight:700,color:C.navy}}>PARTES</p>
      <p style={{margin:"0 0 2px"}}><strong>ARRENDADOR:</strong> {d.owner.name||"_______________"}, cédula No. {d.owner.id||"_________"}, domicilio: {d.owner.address||"_______________"}, tel. {d.owner.phone||"_________"}.</p>
      <p style={{margin:"0 0 2px"}}><strong>ARRENDATARIO:</strong> {d.tenant.name||"_______________"}, cédula No. {d.tenant.id||"_________"}, domicilio: {d.tenant.address||"_______________"}, tel. {d.tenant.phone||"_________"}.</p>
      <p style={{margin:0}}><strong>CORREDOR:</strong> {d.broker.name||"_______________"}, Licencia No. {d.broker.license||"_________"}.</p>
    </InfoBox>
    <p style={{fontWeight:700,color:C.navy,margin:"0 0 5px",fontSize:12}}>CLÁUSULAS</p>
    <p style={{margin:"0 0 7px"}}><strong>PRIMERA — OBJETO:</strong> EL ARRENDADOR cede en arrendamiento al ARRENDATARIO el siguiente inmueble:</p>
    <PropBox d={d.property}/>
    <p style={{margin:"0 0 7px"}}><strong>SEGUNDA — CANON:</strong> Canon mensual de <strong>USD ${ct.rentalPrice||"_________"}</strong>, pagadero los primeros <strong>{ct.payDay||"5"}</strong> días de cada mes. Recargo por mora del <strong>{ct.lateFeePct||"5"}%</strong> mensual.</p>
    <p style={{margin:"0 0 7px"}}><strong>TERCERA — DEPÓSITO:</strong> Depósito de garantía de <strong>USD ${ct.deposit||"_________"}</strong>, reembolsable al término del contrato previa verificación del inmueble.</p>
    <p style={{margin:"0 0 7px"}}><strong>CUARTA — VIGENCIA:</strong> <strong>{ct.rentalDuration||"12"} meses</strong>, desde {ct.startDate||"_______________"} hasta {ct.endDate||"_______________"}. Renovable con 60 días de anticipación.</p>
    <p style={{margin:"0 0 7px"}}><strong>QUINTA — USO:</strong> Uso exclusivo como {d.property.type==="local_comercial"||d.property.type==="oficina"||d.property.type==="bodega"?"establecimiento comercial":"vivienda"}. Prohibido subarrendar sin autorización escrita.</p>
    <p style={{margin:"0 0 7px"}}><strong>SEXTA — MANTENIMIENTO:</strong> Reparaciones menores a cargo del ARRENDATARIO; reparaciones mayores a cargo del ARRENDADOR.</p>
    <p style={{margin:"0 0 7px"}}><strong>SÉPTIMA — TERMINACIÓN ANTICIPADA:</strong> {ct.penaltyEarly?<>Penalidad de <strong>USD ${ct.penaltyEarly}</strong>.</>:"Terminable con 60 días de aviso escrito."}</p>
    <p style={{margin:"0 0 7px"}}><strong>OCTAVA — COMISIÓN:</strong> EL ARRENDADOR pagará al CORREDOR <strong>{ct.commRental||"100"}%</strong> del primer mes.</p>
    <p style={{margin:"0 0 7px"}}><strong>NOVENA — LEGISLACIÓN:</strong> Ley 93 de 1973. Tribunales competentes de Panamá.</p>
    {ct.additionalTerms&&<p style={{margin:"0 0 7px"}}><strong>TÉRMINOS ADICIONALES:</strong> {ct.additionalTerms}</p>}
    <SignBlock parties={parties} signatures={signatures} onSign={onSign} onClear={onClear} editMode={editMode} signType={signType}/>
    <Annex photos={[{src:d.broker.licensePhoto,label:"Licencia"},{src:d.broker.photo,label:"ID Corredor"},{src:d.owner.photo,label:"ID Arrendador"},{src:d.tenant.photo,label:"ID Arrendatario"}]}/>
    <CFooter/></div>);
}

function PromisePreview({d,signatures,onSign,onClear,editMode,signType}){
  const ct=d.contract;
  const parties=[{key:"owner",n:d.owner.name,s:`Cédula: ${d.owner.id||"___"}`,r:"Prom. Vendedor"},{key:"buyer",n:d.buyer.name,s:`Cédula: ${d.buyer.id||"___"}`,r:"Prom. Comprador"},{key:"broker",n:d.broker.name,s:`Lic: ${d.broker.license||"___"}`,r:"Corredor"}];
  return(<div style={{lineHeight:1.65,fontSize:12,color:"#000"}}>
    <CHeader title="Contrato de Promesa de Compraventa" subtitle={ct.date}/>
    <InfoBox>
      <p style={{margin:"0 0 3px",fontWeight:700,color:C.navy}}>PARTES</p>
      <p style={{margin:"0 0 2px"}}><strong>PROMITENTE VENDEDOR:</strong> {d.owner.name||"_______________"}, cédula No. {d.owner.id||"_________"}, domicilio: {d.owner.address||"_______________"}, tel. {d.owner.phone||"_________"}.</p>
      <p style={{margin:"0 0 2px"}}><strong>PROMITENTE COMPRADOR:</strong> {d.buyer.name||"_______________"}, cédula No. {d.buyer.id||"_________"}, domicilio: {d.buyer.address||"_______________"}, tel. {d.buyer.phone||"_________"}.</p>
      <p style={{margin:0}}><strong>CORREDOR:</strong> {d.broker.name||"_______________"}, Licencia No. {d.broker.license||"_________"}.</p>
    </InfoBox>
    <p style={{fontWeight:700,color:C.navy,margin:"0 0 5px",fontSize:12}}>CLÁUSULAS</p>
    <p style={{margin:"0 0 7px"}}><strong>PRIMERA — OBJETO:</strong> Las partes se comprometen a celebrar contrato definitivo de compraventa del siguiente inmueble:</p>
    <PropBox d={d.property}/>
    <p style={{margin:"0 0 7px"}}><strong>SEGUNDA — PRECIO:</strong> Precio pactado de <strong>USD ${ct.salePrice||"_________"}</strong>.</p>
    <p style={{margin:"0 0 7px"}}><strong>TERCERA — ARRAS:</strong> EL PROMITENTE COMPRADOR entrega <strong>USD ${ct.deposit||"_________"}</strong> ({ct.promiseDeposit||"10"}% del precio) como arras confirmatorias. Si el COMPRADOR desiste, pierde las arras. Si el VENDEDOR desiste, devolverá el doble.</p>
    <p style={{margin:"0 0 7px"}}><strong>CUARTA — PLAZO:</strong> Escritura pública dentro de <strong>{ct.promiseDeadline||"90"} días calendario</strong> desde la firma.</p>
    <p style={{margin:"0 0 7px"}}><strong>QUINTA — CONDICIONES:</strong> El VENDEDOR entregará paz y salvos de IDAAN, ENSA, municipio, administración; certificado del Registro Público; paz y salvo de impuesto de inmueble.</p>
    <p style={{margin:"0 0 7px"}}><strong>SEXTA — ESTADO:</strong> Inmueble libre de gravámenes, hipotecas, litigios, embargos y servidumbres no declaradas.</p>
    <p style={{margin:"0 0 7px"}}><strong>SÉPTIMA — GASTOS:</strong> Escritura, impuesto de transferencia (2%) y registro conforme a ley.</p>
    <p style={{margin:"0 0 7px"}}><strong>OCTAVA — COMISIÓN:</strong> EL VENDEDOR pagará al CORREDOR <strong>{ct.commSale||"5"}%</strong> del precio al cierre.</p>
    <p style={{margin:"0 0 7px"}}><strong>NOVENA — LEGISLACIÓN:</strong> Código Civil de Panamá, Libro IV.</p>
    {ct.additionalTerms&&<p style={{margin:"0 0 7px"}}><strong>TÉRMINOS ADICIONALES:</strong> {ct.additionalTerms}</p>}
    <SignBlock parties={parties} signatures={signatures} onSign={onSign} onClear={onClear} editMode={editMode} signType={signType}/>
    <Annex photos={[{src:d.broker.licensePhoto,label:"Licencia"},{src:d.broker.photo,label:"ID Corredor"},{src:d.owner.photo,label:"ID Vendedor"},{src:d.buyer.photo,label:"ID Comprador"}]}/>
    <CFooter/></div>);
}

function SalePreview({d,signatures,onSign,onClear,editMode,signType}){
  const ct=d.contract;
  const parties=[{key:"owner",n:d.owner.name,s:`Cédula: ${d.owner.id||"___"}`,r:"Vendedor"},{key:"buyer",n:d.buyer.name,s:`Cédula: ${d.buyer.id||"___"}`,r:"Comprador"},{key:"broker",n:d.broker.name,s:`Lic: ${d.broker.license||"___"}`,r:"Corredor"}];
  return(<div style={{lineHeight:1.65,fontSize:12,color:"#000"}}>
    <CHeader title="Contrato de Compraventa" subtitle={ct.date}/>
    <InfoBox>
      <p style={{margin:"0 0 3px",fontWeight:700,color:C.navy}}>PARTES</p>
      <p style={{margin:"0 0 2px"}}><strong>VENDEDOR:</strong> {d.owner.name||"_______________"}, cédula No. {d.owner.id||"_________"}, domicilio: {d.owner.address||"_______________"}, tel. {d.owner.phone||"_________"}.</p>
      <p style={{margin:"0 0 2px"}}><strong>COMPRADOR:</strong> {d.buyer.name||"_______________"}, cédula No. {d.buyer.id||"_________"}, domicilio: {d.buyer.address||"_______________"}, tel. {d.buyer.phone||"_________"}.</p>
      <p style={{margin:0}}><strong>CORREDOR:</strong> {d.broker.name||"_______________"}, Licencia No. {d.broker.license||"_________"}.</p>
    </InfoBox>
    <p style={{fontWeight:700,color:C.navy,margin:"0 0 5px",fontSize:12}}>CLÁUSULAS</p>
    <p style={{margin:"0 0 7px"}}><strong>PRIMERA — OBJETO:</strong> EL VENDEDOR vende, cede y transfiere a EL COMPRADOR, quien acepta, el siguiente inmueble:</p>
    <PropBox d={d.property}/>
    <p style={{margin:"0 0 7px"}}><strong>SEGUNDA — PRECIO Y PAGO:</strong> Precio total de <strong>USD ${ct.salePrice||"_________"}</strong>. {ct.deposit?<>Abono inicial de <strong>USD ${ct.deposit}</strong>, saldo al firmar escritura.</>:"Pagadero al firmar escritura pública ante Notario."}</p>
    <p style={{margin:"0 0 7px"}}><strong>TERCERA — TRADICIÓN:</strong> EL VENDEDOR otorgará escritura pública ante Notario e inscribirá en el Registro Público.</p>
    <p style={{margin:"0 0 7px"}}><strong>CUARTA — SANEAMIENTO:</strong> Garantía de saneamiento por evicción y vicios ocultos. Inmueble libre de gravámenes.</p>
    <p style={{margin:"0 0 7px"}}><strong>QUINTA — ENTREGA:</strong> Entrega material al firmar escritura pública.</p>
    <p style={{margin:"0 0 7px"}}><strong>SEXTA — GASTOS:</strong> Impuesto de transferencia (2%), gastos notariales y de registro conforme a ley.</p>
    <p style={{margin:"0 0 7px"}}><strong>SÉPTIMA — PAZ Y SALVOS:</strong> IDAAN, ENSA/Naturgy, Municipio, Administración, impuesto de inmueble.</p>
    <p style={{margin:"0 0 7px"}}><strong>OCTAVA — COMISIÓN:</strong> EL VENDEDOR pagará al CORREDOR <strong>{ct.commSale||"5"}%</strong> del precio.</p>
    <p style={{margin:"0 0 7px"}}><strong>NOVENA — LEGISLACIÓN:</strong> Código Civil de Panamá y leyes complementarias.</p>
    {ct.additionalTerms&&<p style={{margin:"0 0 7px"}}><strong>TÉRMINOS ADICIONALES:</strong> {ct.additionalTerms}</p>}
    <SignBlock parties={parties} signatures={signatures} onSign={onSign} onClear={onClear} editMode={editMode} signType={signType}/>
    <Annex photos={[{src:d.broker.licensePhoto,label:"Licencia"},{src:d.broker.photo,label:"ID Corredor"},{src:d.owner.photo,label:"ID Vendedor"},{src:d.buyer.photo,label:"ID Comprador"}]}/>
    <CFooter/></div>);
}

/* ═══ CONTRACT TYPE CONFIG ═══ */
const CTS=[
  {id:"auth",label:"Autorización",icon:"📋",desc:"Autorización para vender o alquilar",color:"#1565C0"},
  {id:"rental",label:"Alquiler",icon:"🔑",desc:"Contrato de arrendamiento",color:"#2E7D32"},
  {id:"promise",label:"Promesa de C/V",icon:"🤝",desc:"Promesa de compraventa con arras",color:"#E65100"},
  {id:"sale",label:"Compraventa",icon:"🏡",desc:"Contrato definitivo de compraventa",color:"#6A1B9A"},
];

/* ═══ MAIN APP ═══ */
export default function Contracts(){
  const [screen,setScreen]=useState("home");
  const [cid,setCid]=useState("auth");
  const [form,setForm]=useState(JSON.parse(JSON.stringify(initForm)));
  const [tab,setTab]=useState(0);
  const [shareOpen,setShareOpen]=useState(false);
  const [shareEmail,setShareEmail]=useState("");
  const [copied,setCopied]=useState(false);
  const [signatures,setSignatures]=useState({});
  const [editMode,setEditMode]=useState(true);
  const [signType,setSignType]=useState("regular");
  const [sendModal,setSendModal]=useState(false);
  const prevRef=useRef();
  const store=useStore();
  const [params]=useSearchParams();
  const [docId,setDocId]=useState(null);
  const [status,setStatus]=useState("draft");
  const [saved,setSaved]=useState([]);
  const [savedMsg,setSavedMsg]=useState("");
  const [profile,setProfile]=useState(null);
  const [fromProp,setFromProp]=useState("");
  const refresh=()=>listContracts().then(setSaved).catch(()=>{});
  useEffect(()=>{refresh();getSetting("broker_profile").then(p=>p&&setProfile(p)).catch(()=>{});},[]);
  const leadParam=params.get("lead"), propParam=params.get("property");
  const prefillFrom=(f,{propId,leadId})=>{
    const n=JSON.parse(JSON.stringify(f));
    if(profile)n.broker={...n.broker,...profile};
    const p=store.properties.find(x=>x.id===propId);
    if(p){n.property={...n.property,type:{house:"casa",land:"terreno",commercial:"local_comercial",office:"oficina"}[p.type]||"apartamento",address:[p.address,locationName(p.location)].filter(Boolean).join(", "),district:"Panamá",corregimiento:locationName(p.location),area:p.area?String(p.area):"",description:p.title};
      if(p.operation==="sale")n.contract.salePrice=p.price.toLocaleString("en-US");else{n.contract.rentalPrice=p.price.toLocaleString("en-US");n.contract.type="alquiler";if(p.deposit)n.contract.deposit=p.deposit.toLocaleString("en-US");}}
    const l=store.leads.find(x=>x.id===leadId);
    if(l){const party={...n.buyer,name:l.name||"",phone:l.phone||"",email:l.email||""};n.buyer=party;n.tenant={...party};}
    return n;
  };

  const uB=f=>v=>setForm(p=>({...p,broker:{...p.broker,[f]:v}}));
  const uO=f=>v=>setForm(p=>({...p,owner:{...p.owner,[f]:v}}));
  const uBu=f=>v=>setForm(p=>({...p,buyer:{...p.buyer,[f]:v}}));
  const uT=f=>v=>setForm(p=>({...p,tenant:{...p.tenant,[f]:v}}));
  const uP=f=>v=>setForm(p=>({...p,property:{...p.property,[f]:v}}));
  const uC=f=>v=>setForm(p=>({...p,contract:{...p.contract,[f]:v}}));

  const start=id=>{setCid(id);setForm(prefillFrom(initForm,{propId:fromProp||propParam,leadId:leadParam}));setTab(0);setSignatures({});setEditMode(true);setSignType("regular");setDocId(null);setStatus("draft");setScreen("form");};
  const openSaved=c=>{setCid(c.kind);setForm({...JSON.parse(JSON.stringify(initForm)),...c.data.form});setSignatures(c.data.signatures||{});setDocId(c.id);setStatus(c.status);setTab(0);setEditMode(true);setSignType(c.data.signType||"regular");setScreen("preview");};
  const strip=f=>{const x=JSON.parse(JSON.stringify(f));["broker","owner","buyer","tenant"].forEach(k=>{if(x[k]){x[k].photo=null;if(k==="broker")x[k].licensePhoto=null;}});return x;};
  const doSave=async(st=status)=>{
    const titleParts=[CTS.find(c=>c.id===cid)?.label,form.property.address||form.property.description,form.owner.name].filter(Boolean);
    try{const r=await saveContract({id:docId,kind:cid,status:st,title:titleParts.join(" · "),data:{form:strip(form),signatures,signType},property_id:fromProp||propParam||null,lead_id:leadParam||null});
      setDocId(r.id);setStatus(st);setSavedMsg("✓ Guardado");setTimeout(()=>setSavedMsg(""),1800);refresh();}catch(e){setSavedMsg("Error: "+(e.message||e));}
  };
  const saveProfile=async()=>{const p={name:form.broker.name,id:form.broker.id,license:form.broker.license,phone:form.broker.phone,email:form.broker.email,address:form.broker.address||""};
    try{await setSetting("broker_profile",p);setProfile(p);setSavedMsg("✓ Perfil guardado");setTimeout(()=>setSavedMsg(""),1800);}catch(e){setSavedMsg("Error: "+(e.message||e));}};
  const onSign=(key,data)=>setSignatures(p=>({...p,[key]:data}));
  const onClear=key=>setSignatures(p=>{const n={...p};delete n[key];return n;});

  const ct=CTS.find(c=>c.id===cid);

  const getTabs=()=>{
    const t=[{id:"broker",label:"Corredor",icon:"👤"}];
    t.push({id:"owner",label:cid==="rental"?"Arrendador":"Propietario",icon:"🏠"});
    if(cid==="rental")t.push({id:"tenant",label:"Arrendatario",icon:"🔑"});
    if(cid==="promise"||cid==="sale")t.push({id:"buyer",label:"Comprador",icon:"🛒"});
    t.push({id:"property",label:"Propiedad",icon:"📍"});
    t.push({id:"contract",label:"Términos",icon:"📄"});
    return t;
  };
  const tabs2=getTabs();

  const downloadHTML=useCallback(html=>{
    const blob=new Blob([html],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`Contrato_${ct?.label?.replace(/[\s/]+/g,"_")||"ROP"}_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  },[ct]);

  const buildHTML=()=>{
    const el=prevRef.current;if(!el)return"";
    return`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Contrato - Realtors of Panama</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter Tight',sans-serif;padding:32px 40px;max-width:820px;margin:0 auto;color:#000;font-size:12px;line-height:1.65}p{margin-bottom:7px}strong{font-weight:700}canvas{display:none}
    @media print{body{padding:16px 24px}img{max-height:120px!important}canvas{display:none}}</style></head><body>${el.innerHTML}</body></html>`;
  };

  const printPDF=useCallback(()=>{
    const html=buildHTML();if(!html)return;
    try{
      const iframe=document.createElement("iframe");iframe.style.cssText="position:fixed;top:-9999px;left:-9999px;width:800px;height:600px;border:none;";
      document.body.appendChild(iframe);const doc=iframe.contentDocument||iframe.contentWindow.document;doc.open();doc.write(html);doc.close();
      setTimeout(()=>{try{iframe.contentWindow.focus();iframe.contentWindow.print();}catch(e){downloadHTML(html);}
        setTimeout(()=>{try{document.body.removeChild(iframe);}catch(e){}},1000);},800);
    }catch(e){downloadHTML(html);}
  },[ct,downloadHTML]);

  const copyAll=()=>{
    const el=prevRef.current;if(!el)return;const range=document.createRange();range.selectNodeContents(el);
    const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);document.execCommand("copy");sel.removeAllRanges();
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };

  const getPartyEmails=()=>{
    const list=[];
    if(form.owner.email)list.push({role:cid==="rental"?"Arrendador":"Propietario",email:form.owner.email,name:form.owner.name,key:"owner"});
    if(form.broker.email)list.push({role:"Corredor",email:form.broker.email,name:form.broker.name,key:"broker"});
    if(cid==="rental"&&form.tenant.email)list.push({role:"Arrendatario",email:form.tenant.email,name:form.tenant.name,key:"tenant"});
    if((cid==="promise"||cid==="sale")&&form.buyer.email)list.push({role:"Comprador",email:form.buyer.email,name:form.buyer.name,key:"buyer"});
    return list;
  };

  const sendToParty=(party)=>{
    const s=encodeURIComponent(`Contrato de ${ct?.label} para firma — Realtors of Panama`);
    const b=encodeURIComponent(`Estimado/a ${party.name},\n\nSe ha generado un Contrato de ${ct?.label} a través de Realtors of Panama que requiere su revisión y firma como ${party.role}.\n\nPor favor revise el documento adjunto y coordine con el corredor para la firma.\n\nSaludos cordiales,\nRealtors of Panama`);
    const a=document.createElement("a");a.href=`mailto:${party.email}?subject=${s}&body=${b}`;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();document.body.removeChild(a);
  };

  const sendWhatsApp=(party)=>{
    const t=encodeURIComponent(`📋 *Contrato de ${ct?.label}*\n\nEstimado/a ${party.name}, se ha generado un contrato que requiere su firma como ${party.role}.\n\nPor favor comuníquese con el corredor para coordinar.\n\n— Realtors of Panama`);
    const phone=party.phone?.replace(/[^0-9+]/g,"")||"";
    const a=document.createElement("a");a.href=`https://wa.me/${phone}?text=${t}`;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();document.body.removeChild(a);
  };

  const renderPreview=()=>{
    const props={d:form,signatures,onSign,onClear,editMode,signType};
    switch(cid){
      case "auth":return <AuthPreview {...props}/>;
      case "rental":return <RentalPreview {...props}/>;
      case "promise":return <PromisePreview {...props}/>;
      case "sale":return <SalePreview {...props}/>;
      default:return null;
    }
  };

  const renderTab=()=>{
    const t=tabs2[tab];if(!t)return null;
    switch(t.id){
      case "broker":return(<Sec icon="👤" title="Datos del Corredor"><Inp label="Nombre" value={form.broker.name} onChange={uB("name")} placeholder="Nombre"/><Inp label="Cédula" value={form.broker.id} onChange={uB("id")} placeholder="8-888-8888"/><Inp label="No. Licencia" value={form.broker.license} onChange={uB("license")} placeholder="Licencia"/><Inp label="Teléfono" value={form.broker.phone} onChange={uB("phone")} placeholder="+507 6000-0000"/><Inp label="Correo" value={form.broker.email} onChange={uB("email")} placeholder="correo@ejemplo.com" full/><FileUp label="Foto de Licencia" value={form.broker.licensePhoto} onChange={uB("licensePhoto")}/><FileUp label="Identificación" value={form.broker.photo} onChange={uB("photo")}/><div style={{gridColumn:"1/-1"}}><button type="button" onClick={saveProfile} style={{padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,border:`1px solid ${C.g200}`,background:"#fff",cursor:"pointer"}}>★ Guardar como mi perfil (se rellena solo en cada contrato)</button>{savedMsg&&<span style={{marginLeft:8,fontSize:12,color:C.green}}>{savedMsg}</span>}</div></Sec>);
      case "owner":return(<Sec icon="🏠" title={cid==="rental"?"Arrendador":"Propietario"}><Inp label="Nombre" value={form.owner.name} onChange={uO("name")} placeholder="Nombre"/><Inp label="Cédula" value={form.owner.id} onChange={uO("id")} placeholder="8-888-8888"/><Inp label="Teléfono" value={form.owner.phone} onChange={uO("phone")} placeholder="+507 6000-0000"/><Inp label="Correo" value={form.owner.email} onChange={uO("email")} placeholder="correo@ejemplo.com"/><Inp label="Dirección" value={form.owner.address} onChange={uO("address")} placeholder="Dirección" full/><FileUp label="Identificación" value={form.owner.photo} onChange={uO("photo")}/></Sec>);
      case "tenant":return(<Sec icon="🔑" title="Arrendatario"><Inp label="Nombre" value={form.tenant.name} onChange={uT("name")} placeholder="Nombre"/><Inp label="Cédula" value={form.tenant.id} onChange={uT("id")} placeholder="8-888-8888"/><Inp label="Teléfono" value={form.tenant.phone} onChange={uT("phone")} placeholder="+507 6000-0000"/><Inp label="Correo" value={form.tenant.email} onChange={uT("email")} placeholder="correo@ejemplo.com"/><Inp label="Dirección" value={form.tenant.address} onChange={uT("address")} placeholder="Dirección" full/><FileUp label="Identificación" value={form.tenant.photo} onChange={uT("photo")}/></Sec>);
      case "buyer":return(<Sec icon="🛒" title="Comprador"><Inp label="Nombre" value={form.buyer.name} onChange={uBu("name")} placeholder="Nombre"/><Inp label="Cédula" value={form.buyer.id} onChange={uBu("id")} placeholder="8-888-8888"/><Inp label="Teléfono" value={form.buyer.phone} onChange={uBu("phone")} placeholder="+507 6000-0000"/><Inp label="Correo" value={form.buyer.email} onChange={uBu("email")} placeholder="correo@ejemplo.com"/><Inp label="Dirección" value={form.buyer.address} onChange={uBu("address")} placeholder="Dirección" full/><FileUp label="Identificación" value={form.buyer.photo} onChange={uBu("photo")}/></Sec>);
      case "property":return(<Sec icon="📍" title="Propiedad"><Sel label="Tipo" value={form.property.type} onChange={uP("type")} options={propTypes}/><Inp label="Superficie (m²)" value={form.property.area} onChange={uP("area")} placeholder="250" type="number"/><Inp label="Dirección" value={form.property.address} onChange={uP("address")} placeholder="Dirección" full/><Sel label="Provincia" value={form.property.province} onChange={uP("province")} options={provinces}/><Inp label="Distrito" value={form.property.district} onChange={uP("district")} placeholder="Distrito"/><Inp label="Corregimiento" value={form.property.corregimiento} onChange={uP("corregimiento")} placeholder="Corregimiento"/><div/><Inp label="Finca" value={form.property.finca} onChange={uP("finca")} placeholder="Finca"/><Inp label="Tomo" value={form.property.tomo} onChange={uP("tomo")} placeholder="Tomo"/><Inp label="Folio" value={form.property.folio} onChange={uP("folio")} placeholder="Folio"/><div/><Txa label="Descripción" value={form.property.description} onChange={uP("description")} placeholder="Recámaras, baños..." full/></Sec>);
      case "contract":return renderTerms();
      default:return null;
    }
  };

  const renderTerms=()=>{
    const c=form.contract;
    switch(cid){
      case "auth":return(<Sec icon="📄" title="Términos"><Radio label="Gestión" value={c.type} onChange={uC("type")} options={[{v:"venta",l:"Venta"},{v:"alquiler",l:"Alquiler"},{v:"ambos",l:"Ambos"}]}/>{(c.type==="venta"||c.type==="ambos")&&<><Inp label="Precio Venta (USD)" value={c.salePrice} onChange={uC("salePrice")} placeholder="250,000"/><Inp label="Comisión (%)" value={c.commSale} onChange={uC("commSale")} placeholder="5" type="number"/></>}{(c.type==="alquiler"||c.type==="ambos")&&<><Inp label="Canon (USD)" value={c.rentalPrice} onChange={uC("rentalPrice")} placeholder="1,500"/><Inp label="Comisión Alquiler (%)" value={c.commRental} onChange={uC("commRental")} placeholder="100" type="number"/></>}<Radio label="Exclusividad" value={c.exclusivity} onChange={uC("exclusivity")} options={[{v:"exclusiva",l:"Exclusiva"},{v:"no_exclusiva",l:"No Exclusiva"}]}/><Inp label="Duración (meses)" value={c.duration} onChange={uC("duration")} placeholder="6" type="number"/><Inp label="Fecha" value={c.date} onChange={uC("date")} placeholder={fmtDate(today)}/><Txa label="Términos Adicionales" value={c.additionalTerms} onChange={uC("additionalTerms")} placeholder="Condiciones..." full/></Sec>);
      case "rental":return(<Sec icon="📄" title="Términos"><Inp label="Canon (USD)" value={c.rentalPrice} onChange={uC("rentalPrice")} placeholder="1,500"/><Inp label="Depósito (USD)" value={c.deposit} onChange={uC("deposit")} placeholder="1,500"/><Inp label="Día de Pago" value={c.payDay} onChange={uC("payDay")} placeholder="5" type="number"/><Inp label="Mora (%)" value={c.lateFeePct} onChange={uC("lateFeePct")} placeholder="5" type="number"/><Inp label="Duración (meses)" value={c.rentalDuration} onChange={uC("rentalDuration")} placeholder="12" type="number"/><Inp label="Comisión (%)" value={c.commRental} onChange={uC("commRental")} placeholder="100" type="number"/><Inp label="Inicio" value={c.startDate} onChange={uC("startDate")} placeholder="1 de mayo de 2026"/><Inp label="Fin" value={c.endDate} onChange={uC("endDate")} placeholder="30 de abril de 2027"/><Inp label="Penalidad (USD)" value={c.penaltyEarly} onChange={uC("penaltyEarly")} placeholder="Opcional" full/><Inp label="Fecha" value={c.date} onChange={uC("date")} placeholder={fmtDate(today)}/><div/><Txa label="Términos Adicionales" value={c.additionalTerms} onChange={uC("additionalTerms")} placeholder="Condiciones..." full/></Sec>);
      case "promise":return(<Sec icon="📄" title="Términos"><Inp label="Precio (USD)" value={c.salePrice} onChange={uC("salePrice")} placeholder="250,000"/><Inp label="Comisión (%)" value={c.commSale} onChange={uC("commSale")} placeholder="5" type="number"/><Inp label="Arras (USD)" value={c.deposit} onChange={uC("deposit")} placeholder="25,000"/><Inp label="% Arras" value={c.promiseDeposit} onChange={uC("promiseDeposit")} placeholder="10" type="number"/><Inp label="Plazo (días)" value={c.promiseDeadline} onChange={uC("promiseDeadline")} placeholder="90" type="number"/><Inp label="Fecha" value={c.date} onChange={uC("date")} placeholder={fmtDate(today)}/><Txa label="Términos Adicionales" value={c.additionalTerms} onChange={uC("additionalTerms")} placeholder="Condiciones..." full/></Sec>);
      case "sale":return(<Sec icon="📄" title="Términos"><Inp label="Precio (USD)" value={c.salePrice} onChange={uC("salePrice")} placeholder="250,000"/><Inp label="Comisión (%)" value={c.commSale} onChange={uC("commSale")} placeholder="5" type="number"/><Inp label="Abono (USD)" value={c.deposit} onChange={uC("deposit")} placeholder="Opcional"/><Inp label="Fecha" value={c.date} onChange={uC("date")} placeholder={fmtDate(today)}/><Txa label="Términos Adicionales" value={c.additionalTerms} onChange={uC("additionalTerms")} placeholder="Condiciones..." full/></Sec>);
      default:return null;
    }
  };

  const btnS={padding:"6px 12px",borderRadius:5,fontSize:10,fontWeight:600,fontFamily:"'Inter Tight',sans-serif",cursor:"pointer",border:"none"};

  /* ═══ HOME ═══ */
  if(screen==="home"){
    return(
      <div style={{fontFamily:"'Inter Tight',sans-serif",background:"#fff",borderRadius:20,overflow:"hidden"}}>
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <div style={{background:`linear-gradient(135deg,${C.navy} 0%,${C.navyL} 50%,${C.navyM} 100%)`,padding:"52px 24px 60px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:.03,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 35px,rgba(255,255,255,.5) 35px,rgba(255,255,255,.5) 36px)"}}/>
          <div style={{position:"relative",zIndex:1}}>
            <img src={LOGO} alt="Logo" style={{width:76,height:76,borderRadius:12,objectFit:"cover",marginBottom:14,border:"2px solid rgba(255,255,255,.12)"}}/>
            <h1 style={{margin:0,fontSize:28,fontWeight:900,color:"#fff",letterSpacing:".1em",textTransform:"uppercase"}}>Realtors of Panama</h1>
            <p style={{margin:"8px 0 0",fontSize:12,color:C.goldL,letterSpacing:".18em",textTransform:"uppercase",fontWeight:500}}>Plataforma de Contratos Inmobiliarios</p>
            <div style={{width:60,height:2,background:C.gold,margin:"18px auto 0",borderRadius:2}}/></div></div>
        <div style={{maxWidth:900,margin:"0 auto",padding:"40px 20px 60px"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",justifyContent:"center",marginBottom:18}}>
            <label style={{fontSize:13,color:C.g600}}>Rellenar desde una propiedad:</label>
            <select value={fromProp||propParam||""} onChange={e=>setFromProp(e.target.value)} style={{...inpS,width:"auto",maxWidth:360,background:"#fff"}}>
              <option value="">— Ninguna —</option>
              {store.properties.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            {leadParam&&<span style={{fontSize:12,background:C.g100,padding:"6px 10px",borderRadius:999}}>Cliente: {store.leads.find(l=>l.id===leadParam)?.name||"—"}</span>}
            {profile?<span style={{fontSize:12,color:C.green}}>✓ Tu perfil de corredor se rellena solo</span>:<span style={{fontSize:12,color:C.g500}}>Tip: guarda tu perfil en la pestaña Corredor</span>}
          </div>
          <p style={{textAlign:"center",fontSize:15,color:C.g600,marginBottom:36,fontWeight:500}}>Selecciona el tipo de contrato</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))",gap:16}}>
            {CTS.map(c=>(
              <div key={c.id} onClick={()=>start(c.id)} style={{cursor:"pointer",border:`1px solid ${C.g200}`,borderRadius:12,padding:"30px 20px",textAlign:"center",transition:"all .25s",background:"#fff",position:"relative",overflow:"hidden"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 8px 30px rgba(11,29,58,.12)";e.currentTarget.style.borderColor=C.navy;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=C.g200;}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.color}}/>
                <div style={{fontSize:34,marginBottom:12}}>{c.icon}</div>
                <h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.navy}}>{c.label}</h3>
                <p style={{margin:"8px 0 0",fontSize:11,color:C.g500,lineHeight:1.5}}>{c.desc}</p>
              </div>))}
          </div>
          {saved.length>0&&<div style={{marginTop:40}}>
            <p style={{fontSize:13,fontWeight:700,color:C.navy,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Contratos guardados</p>
            <div style={{border:`1px solid ${C.g200}`,borderRadius:12,overflow:"hidden"}}>
              {saved.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderBottom:`1px solid ${C.g100}`}}>
                <span style={{fontSize:20}}>{CTS.find(x=>x.id===c.kind)?.icon}</span>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:C.navy,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title||CTS.find(x=>x.id===c.kind)?.label}</div>
                  <div style={{fontSize:11,color:C.g500}}>{new Date(c.updated_at).toLocaleDateString("es-PA",{day:"numeric",month:"short",year:"numeric"})}</div></div>
                <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6,background:c.status==="signed"?"#e8f5e9":c.status==="sent"?"#e3f2fd":c.status==="cancelled"?C.g100:"#fff8e1",color:c.status==="signed"?C.green:c.status==="sent"?C.blue:C.g600}}>{({draft:"Borrador",sent:"Enviado",signed:"Firmado",cancelled:"Cancelado"})[c.status]}</span>
                <button onClick={()=>openSaved(c)} style={{...btnS,background:C.navy,color:"#fff"}}>Abrir</button>
                <button onClick={async()=>{if(confirm("¿Eliminar este contrato?")){await deleteContract(c.id);refresh();}}} style={{...btnS,background:"#fff",color:C.red,border:`1px solid ${C.g200}`}}>Eliminar</button>
              </div>))}
            </div></div>}
          </div></div>);
  }

  /* ═══ FORM / PREVIEW ═══ */
  return(
    <div style={{fontFamily:"'Inter Tight',sans-serif",background:"#fff",borderRadius:20,overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{background:C.navy,padding:"9px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setScreen("home")}>
          <img src={LOGO} alt="" style={{width:30,height:30,borderRadius:5,objectFit:"cover"}}/>
          <div><div style={{color:"#fff",fontSize:12,fontWeight:700,letterSpacing:".05em"}}>REALTORS OF PANAMA</div>
            <div style={{color:C.gold,fontSize:8,letterSpacing:".12em",textTransform:"uppercase"}}>{ct?.label}</div></div></div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          <button onClick={()=>setScreen("home")} style={{...btnS,border:"1px solid rgba(255,255,255,.2)",background:"transparent",color:"#fff"}}>← Inicio</button>
          {["form","preview"].map(s=>(
            <button key={s} onClick={()=>setScreen(s)} style={{...btnS,background:screen===s?"#fff":"rgba(255,255,255,.15)",color:screen===s?C.navy:"#fff"}}>{s==="form"?"Formulario":"Vista Previa"}</button>))}
          <button onClick={()=>doSave()} style={{...btnS,fontWeight:700,background:"#fff",color:C.navy}}>💾 Guardar</button>
          <select value={status} onChange={e=>doSave(e.target.value)} style={{...btnS,background:"rgba(255,255,255,.15)",color:"#fff"}}>
            {[["draft","Borrador"],["sent","Enviado"],["signed","Firmado"],["cancelled","Cancelado"]].map(([v,l])=><option key={v} value={v} style={{color:"#000"}}>{l}</option>)}
          </select>
          {savedMsg&&<span style={{color:C.goldL,fontSize:11,alignSelf:"center"}}>{savedMsg}</span>}
          {screen==="preview"&&<>
            <button onClick={printPDF} style={{...btnS,fontWeight:700,background:C.gold,color:C.navy}}>⎙ Imprimir / PDF</button>
            <button onClick={()=>{const h=buildHTML();if(h)downloadHTML(h);}} style={{...btnS,fontWeight:700,background:"#fff",color:C.navy}}>⬇ Descargar</button>
            <button onClick={()=>setSendModal(true)} style={{...btnS,fontWeight:700,background:C.green,color:"#fff"}}>✉ Enviar a Firmar</button>
          </>}
        </div></div>

      {screen==="form"?(
        <div style={{maxWidth:860,margin:"0 auto",padding:"18px 18px 46px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,padding:"9px 14px",background:C.g50,borderRadius:7,border:`1px solid ${C.g200}`}}>
            <span style={{fontSize:18}}>{ct?.icon}</span>
            <div><div style={{fontSize:12,fontWeight:700,color:C.navy}}>{ct?.label}</div><div style={{fontSize:9,color:C.g500}}>{ct?.desc}</div></div></div>
          <div style={{display:"flex",gap:2,marginBottom:22,borderBottom:`2px solid ${C.g200}`,overflowX:"auto"}}>
            {tabs2.map((t,i)=>(
              <button key={t.id} onClick={()=>setTab(i)} style={{padding:"8px 14px",border:"none",cursor:"pointer",fontFamily:"'Inter Tight',sans-serif",fontSize:11,fontWeight:600,
                background:"none",color:tab===i?C.navy:C.g400,borderBottom:tab===i?`3px solid ${C.navy}`:"3px solid transparent",marginBottom:-2,whiteSpace:"nowrap"}}>
                <span style={{marginRight:4}}>{t.icon}</span>{t.label}</button>))}
          </div>
          {renderTab()}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20,paddingTop:14,borderTop:`1px solid ${C.g200}`}}>
            <button onClick={()=>setTab(Math.max(0,tab-1))} disabled={tab===0}
              style={{...btnS,border:`1px solid ${C.g200}`,background:"#fff",color:tab===0?C.g400:C.navy,opacity:tab===0?.5:1}}>← Anterior</button>
            {tab<tabs2.length-1?(
              <button onClick={()=>setTab(tab+1)} style={{...btnS,background:C.navy,color:"#fff"}}>Siguiente →</button>
            ):(
              <button onClick={()=>setScreen("preview")} style={{...btnS,fontWeight:700,background:C.gold,color:C.navy}}>Ver Contrato →</button>
            )}
          </div></div>
      ):(
        <div style={{maxWidth:800,margin:"0 auto",padding:"24px 20px 46px"}}>
          {/* Editing toolbar */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:16,padding:"10px 14px",background:C.g50,borderRadius:8,border:`1px solid ${C.g200}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:editMode?C.green:C.g400}}/>
              <span style={{fontSize:11,fontWeight:600,color:C.navy}}>{editMode?"Modo Edición — Click en el texto para editar":"Modo Vista — Documento listo"}</span>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              {/* Sign type toggle */}
              <div style={{display:"flex",borderRadius:5,overflow:"hidden",border:`1px solid ${C.g200}`}}>
                <button onClick={()=>{setSignType("regular");setSignatures({});}} style={{...btnS,borderRadius:0,background:signType==="regular"?C.navy:"#fff",color:signType==="regular"?"#fff":C.navy,border:"none",fontSize:9}}>✍ Firma Manual</button>
                <button onClick={()=>setSignType("digital")} style={{...btnS,borderRadius:0,background:signType==="digital"?C.navy:"#fff",color:signType==="digital"?"#fff":C.navy,border:"none",borderLeft:`1px solid ${C.g200}`,fontSize:9}}>🖊 Firma Digital</button>
              </div>
              <button onClick={()=>setEditMode(!editMode)} style={{...btnS,background:editMode?C.g200:C.navy,color:editMode?C.navy:"#fff"}}>
                {editMode?"🔒 Bloquear":"✏️ Editar"}</button>
              <button onClick={()=>setSendModal(true)} style={{...btnS,fontWeight:700,background:C.green,color:"#fff"}}>✉ Enviar a Firmar</button>
            </div>
          </div>

          <div ref={prevRef} contentEditable={editMode} suppressContentEditableWarning={true}
            style={{outline:"none",border:editMode?`2px solid ${C.blue}22`:"none",borderRadius:8,padding:editMode?12:0,
              transition:"all .2s",minHeight:200}}>
            {renderPreview()}
          </div>
        </div>
      )}

      {/* ═══ SEND TO SIGN MODAL ═══ */}
      {sendModal&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setSendModal(false)}>
          <div style={{background:"#fff",borderRadius:12,padding:24,maxWidth:500,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:700,color:C.navy}}>✉ Enviar Contrato para Firma</h3>
              <button onClick={()=>setSendModal(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.g500}}>×</button>
            </div>

            {/* Signing status */}
            <div style={{marginBottom:20}}>
              <p style={{fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",marginBottom:8}}>Estado de Firmas</p>
              {getPartyEmails().map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",marginBottom:6,background:C.g50,borderRadius:6,border:`1px solid ${C.g200}`}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:C.navy}}>{p.name||p.role}</div>
                    <div style={{fontSize:10,color:C.g500}}>{p.role} — {p.email}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {signatures[p.key]?(
                      <span style={{fontSize:10,fontWeight:700,color:C.green,background:"#e8f5e9",padding:"3px 8px",borderRadius:4}}>✓ Firmado</span>
                    ):(
                      <span style={{fontSize:10,fontWeight:600,color:C.gold,background:"#fff8e1",padding:"3px 8px",borderRadius:4}}>⏳ Pendiente</span>
                    )}
                  </div>
                </div>
              ))}
              {getPartyEmails().length===0&&(
                <p style={{fontSize:11,color:C.g500,fontStyle:"italic"}}>Agregue correos en el formulario para enviar a las partes.</p>
              )}
            </div>

            {/* Send actions per party */}
            <p style={{fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",marginBottom:8}}>Enviar a cada parte</p>
            {getPartyEmails().map((p,i)=>(
              <div key={i} style={{display:"flex",gap:6,marginBottom:8}}>
                <button onClick={()=>sendToParty(p)} style={{flex:1,...btnS,padding:"9px",background:C.navy,color:"#fff",fontWeight:600}}>
                  ✉ Email a {p.role}</button>
                <button onClick={()=>sendWhatsApp({...p,phone:p.key==="owner"?form.owner.phone:p.key==="broker"?form.broker.phone:p.key==="tenant"?form.tenant.phone:form.buyer.phone})}
                  style={{...btnS,padding:"9px 12px",background:"#fff",color:C.green,border:`1px solid ${C.green}`,fontWeight:600}}>💬</button>
              </div>
            ))}

            <div style={{borderTop:`1px solid ${C.g200}`,marginTop:16,paddingTop:16}}>
              <p style={{fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",marginBottom:8}}>Exportar y enviar manualmente</p>
              <button onClick={()=>{setSendModal(false);printPDF();}} style={{width:"100%",...btnS,padding:"10px",fontWeight:700,background:C.gold,color:C.navy,marginBottom:6}}>⎙ Exportar PDF para adjuntar</button>
              <button onClick={()=>{copyAll();}} style={{width:"100%",...btnS,padding:"10px",fontWeight:600,border:`1px solid ${C.navy}`,background:copied?C.green:"#fff",color:copied?"#fff":C.navy}}>
                {copied?"✓ Copiado":"📋 Copiar contrato"}</button>
            </div>

            <div style={{borderTop:`1px solid ${C.g200}`,marginTop:16,paddingTop:16}}>
              <p style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:6}}>💡 Recomendación para Firma Digital</p>
              <p style={{fontSize:11,color:C.g600,lineHeight:1.6,margin:0}}>
                Para validez legal completa, recomendamos usar un servicio de firma electrónica como <strong>DocuSign</strong>, <strong>PandaDoc</strong>, o <strong>SignNow</strong>.
                Exporte el PDF, súbalo a la plataforma de su preferencia, y envíe a cada parte para firma con certificado digital.
                Panamá reconoce la firma electrónica bajo la <strong>Ley 51 de 2008</strong> (Comercio Electrónico).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
