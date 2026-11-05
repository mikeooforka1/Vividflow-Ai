import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ProcessingPanel, {duration, stageEstimate} from './ProcessingPanel';
test('time estimates use only measured stage speed and available frames', () => {
  expect(stageEstimate({stage:'encoding',stageFps:10,framesTotal:100,framesProcessed:50})).toBeNull();
  expect(stageEstimate({stage:'lip_sync',stageFps:2,lipSyncTotal:40,lipSyncProcessed:10})).toBe(15);
  expect(stageEstimate({stage:'face_swap',stageFps:0,framesTotal:100,framesProcessed:10})).toBeNull();
  expect(duration(65)).toBe('1m 5s');
});
test('lip sync panel includes actual stages, skipped-frame counts and cancellation', () => {
  const markup=renderToStaticMarkup(<ProcessingPanel job={{status:'processing',stage:'lip_sync',mode:'face_lipsync',progress:70,created:Date.now(),framesTotal:20,framesReplaced:18,framesSkipped:2,lipSyncFrames:8,lipSyncTotal:20,history:[{stage:'face_swap',detail:'Identity selected'}]}} />);
  expect(markup).toContain('Generating lip movements');
  expect(markup).toContain('Preparing speech audio');
  expect(markup).toContain('Cancel render');
  expect(markup).toContain('Overall render progress');
});
test('failed renders show actionable backend errors without a success button', () => {
  const markup=renderToStaticMarkup(<ProcessingPanel job={{status:'failed',stage:'failed',mode:'face_lipsync',created:Date.now(),error:'Uploaded audio is silent.'}} />);
  expect(markup).toContain('Uploaded audio is silent.');
  expect(markup).not.toContain('Preview &amp; download result');
});
