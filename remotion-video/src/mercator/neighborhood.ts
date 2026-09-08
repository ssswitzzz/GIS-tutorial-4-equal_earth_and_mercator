export const neighborhoodPoint=(x:number,y:number,t:number):[number,number]=>{
  const u=(x-130)/1110,v=(y-290)/600;
  const corners=[[190,330],[1180,300],[1030,875],[295,790]];
  const weights=[(1-u)*(1-v),u*(1-v),u*v,(1-u)*v];
  const tx=corners.reduce((sum,p,i)=>sum+p[0]*weights[i],0),ty=corners.reduce((sum,p,i)=>sum+p[1]*weights[i],0);
  return [x+(tx-x)*t,y+(ty-y)*t];
};
export const neighborhoodBlock=(x:number,y:number,t:number)=>[[x,y],[x+154,y],[x+154,y+130],[x,y+130]].map(([px,py])=>neighborhoodPoint(px,py,t));
