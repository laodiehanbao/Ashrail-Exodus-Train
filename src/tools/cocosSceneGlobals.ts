import {
  color,
  pushObject,
  vec3,
  vec4,
} from './cocosSceneSerialization.js';
import type { SceneBuildContext } from './cocosSceneSerialization.types.js';

export function addSceneGlobals(context: SceneBuildContext, sceneId: number): void {
  const globalsId = pushObject(context, { __type__: 'cc.SceneGlobals' });
  const ambientId = pushObject(context, {
    __type__: 'cc.AmbientInfo',
    _skyColorHDR: vec4(0, 0, 0, 0.520833125),
    _skyColor: vec4(0, 0, 0, 0.520833125),
    _skyIllumHDR: 20000,
    _skyIllum: 20000,
    _groundAlbedoHDR: vec4(0, 0, 0, 0),
    _groundAlbedo: vec4(0, 0, 0, 0),
    _skyColorLDR: vec4(0.2, 0.5, 0.8, 1),
    _skyIllumLDR: 20000,
    _groundAlbedoLDR: vec4(0.2, 0.2, 0.2, 1),
  });
  const shadowsId = pushObject(context, {
    __type__: 'cc.ShadowsInfo',
    _enabled: false,
    _type: 0,
    _normal: vec3(0, 1, 0),
    _distance: 0,
    _shadowColor: color(76, 76, 76, 255),
    _maxReceived: 4,
    _size: { __type__: 'cc.Vec2', x: 512, y: 512 },
  });
  const skyboxId = pushObject(context, {
    __type__: 'cc.SkyboxInfo',
    _envLightingType: 0,
    _enabled: false,
    _useHDR: true,
  });
  const fogId = pushObject(context, {
    __type__: 'cc.FogInfo',
    _type: 0,
    _fogColor: color(200, 200, 200, 255),
    _enabled: false,
  });
  const octreeId = pushObject(context, {
    __type__: 'cc.OctreeInfo',
    _enabled: false,
    _minPos: vec3(-1024, -1024, -1024),
    _maxPos: vec3(1024, 1024, 1024),
    _depth: 8,
  });
  const skinId = pushObject(context, {
    __type__: 'cc.SkinInfo',
    _enabled: false,
    _scale: 5,
  });
  context.objects[globalsId] = {
    __type__: 'cc.SceneGlobals',
    ambient: { __id__: ambientId },
    shadows: { __id__: shadowsId },
    _skybox: { __id__: skyboxId },
    fog: { __id__: fogId },
    octree: { __id__: octreeId },
    skin: { __id__: skinId },
  };
  context.objects[sceneId]._globals = { __id__: globalsId };
}
