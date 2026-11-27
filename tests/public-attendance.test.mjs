import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAttendance as calc } from '../src/lib/public-attendance.mjs';

test('at threshold: no skips or recovery', () => assert.deepEqual(calc(30,40,75), {percentage:75,safeSkips:0,recovery:0,meetsTarget:true}));
test('above threshold: maximum whole safe skips', () => { assert.equal(calc(36,40,75).safeSkips,8); });
test('below threshold: minimum recovery', () => { assert.equal(calc(25,40,75).recovery,20); });
test('100 percent with absences is unreachable', () => assert.equal(calc(39,40,100).recovery,null));
test('no classes yet has no percentage', () => assert.equal(calc(0,0,75).percentage,null));
test('invalid input rejected', () => { for(const args of [[41,40,75],[-1,40,75],[2.5,40,75],[1,2,0],[1,2,101],[NaN,2,75],[0,1000001,75]]) assert.throws(()=>calc(...args),RangeError); });
test('integer threshold invariants for representative inputs', () => {
  for (const target of [1,50,75,80,99,100]) for(let total=1;total<=100;total++) for(let attended=0;attended<=total;attended++){
    const r=calc(attended,total,target);
    if(r.meetsTarget){assert.ok(100*attended>=target*(total+r.safeSkips));assert.ok(100*attended<target*(total+r.safeSkips+1));}
    else if(r.recovery!==null){assert.ok(100*(attended+r.recovery)>=target*(total+r.recovery));assert.ok(100*(attended+r.recovery-1)<target*(total+r.recovery-1));}
  }
});
