let nextEid = 1;
const ECS = {
entities: new Set,
bug: new Map,
pos: new Map,
vel: new Map,
think: new Map,
wall: new Map,
team: new Map,
combat: new Map,
food: new Map,
obstacle: new Map
};
const C = ECS;
function ecsClear() {
ECS.entities.clear();
for (const k in ECS) ECS[k] instanceof Map && ECS[k].clear();
nextEid = 1
}
function ecsSpawn(comps) {
const e = nextEid++;
ECS.entities.add(e);
for (const k in comps) ECS[k].set(e, comps[k]);
return e
}
function ecsKill(e) {
ECS.entities.delete(e);
for (const k in ECS) ECS[k] instanceof Map && ECS[k].delete(e)
}
function ecsQuery(...comps) {
const out = [];
for (const e of ECS.entities) comps.every(c => ECS[c].has(e)) && out.push(e);
return out
}
