import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import ReplacementStudio from './ReplacementStudio';
let container, root;
beforeEach(()=>{
  global.IS_REACT_ACT_ENVIRONMENT=true;
  URL.revokeObjectURL=jest.fn();
  URL.createObjectURL=jest.fn(()=>"blob:test");
  container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);
});
afterEach(()=>{act(()=>root.unmount());container.remove();jest.restoreAllMocks();});
async function render(capabilities){
  global.fetch=jest.fn().mockResolvedValue({json:async()=>({ready:true,capabilities,authRequired:false,limits:{lipSyncSeconds:15}})});
  await act(async()=>root.render(<ReplacementStudio />));
}
test('all four modes are available when the real backend reports readiness; lip mode exposes audio',async()=>{
  await render({object:true,person:true,face:true,face_lipsync:true});
  const radios=[...container.querySelectorAll('input[type="radio"]')];
  expect(radios).toHaveLength(4);expect(radios[2].disabled).toBe(false);expect(radios[3].disabled).toBe(false);
  await act(async()=>radios[3].click());
  expect(container.textContent).toContain('Choose speech audio');
  expect(container.textContent).toContain('CPU lip-sync checklist');
  expect(container.querySelector('select').value).toBe('original');
});
test('missing optional models disable only their modes and display backend diagnosis',async()=>{
  await render({object:true,person:true,face:true,face_lipsync:false,lipSyncError:'WAV2LIP_MODEL_PATH does not exist.'});
  const radios=[...container.querySelectorAll('input[type="radio"]')];
  expect(radios[0].disabled).toBe(false);expect(radios[1].disabled).toBe(false);expect(radios[2].disabled).toBe(false);expect(radios[3].disabled).toBe(true);
  expect(container.textContent).toContain('WAV2LIP_MODEL_PATH does not exist.');
});
