// Coordinates follow the supplied sketches, from top to bottom. Units are schematic.
export const plans = {
  1: {rooms:[[1,2,3,2,'Stairs'],[1,6,2.5,2,'Gate'],[1,10,3,3,'Video cabin'],[4,10,3,3,'Server room'],[1,32,4,3,'Washroom'],[15,32,4,3,'Meeting room']], features:[[9,2,4,1.5,'Sofa'],[6,33,8,1,'Projector']], exits:[[19,11,'Exit 1'],[19,28,'Exit 2']], desks:[['T1',10,6,3,5,2,true],['T2',1,15,6,1.6,3],['T3',1,21,6,1.6,3],['T4',1,27,6,1.6,3],['T5',10,15,5,2,2],['T6',10,21,5,2,2],['T7',10,27,5,2.5,2]]},
  2: {rooms:[[1,2,3,3,'Stairs'],[1,13,3,6,'Conference room'],[1,19,3,4,'Dinesh room'],[1,23,3,8,'Vishnu room'],[1,33,4,2,'Washrooms'],[11,8,5,4,'Office cabin'],[13,32,4,2,'Server room']], features:[[7,2,2,1,'Lounge'],[10,4,1,2,'Lounge'],[7,6,2,1,'Lounge'],[4,12,2,1,'Main door']], exits:[[19,13,'Exit 1'],[19,26,'Exit 2'],[19,34,'Exit 3']], desks:[['T1',11,14,3,4,2,true],['T2',8,20,8,1.6,3],['T3',8,24,8,1.6,3],['T4',8,28,8,1.6,3],['T5',8,33,3,1.4,2]]},
  3: {rooms:[[1,2,3,3,'Stairs'],[8,1,6,3,'Meeting room'],[1,32,3,3,'Washroom'],[10,32,4,3,'HR cabin']], features:[[.3,10,.4,17,'Whiteboard']], exits:[[19,11,'Exit 1'],[19,26,'Exit 2'],[17,33,'Exit 3']], desks:[['T1',2,9,6,1.6,4],['T2',2,14,6,1.6,4],['T3',2,19,6,1.6,4],['T4',2,24,6,1.6,4],['T5',11,9,3,2,2],['T6',11,14,3,1.4,2],['T7',11,19,3,1.4,2],['T8',11,24,3,1.4,2]]}
};
export function seatsFor(floor) {
 return plans[floor].desks.flatMap(([id,x,z,w,d,n,vertical])=>[0,1].flatMap(side=>Array.from({length:n},(_,i)=>({id:`F${floor}-${id}-S${side*n+i+1}`,x:vertical?x+(side?w+.65:-.65):x+(i+.5)*w/n,z:vertical?z+(i+.5)*d/n:z+(side?d+.65:-.65),angle:vertical?(side?-Math.PI/2:Math.PI/2):(side?Math.PI:0)}))));
}
