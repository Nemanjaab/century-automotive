(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, v) => {
    const t = clamp((v-a)/(b-a));
    return t*t*(3-2*t);
  };
  const lerp = (a,b,t) => a+(b-a)*t;

  const header = $('.site-header');
  addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 30), {passive:true});

  const glow = $('.cursor-glow');
  if (glow) addEventListener('pointermove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, {passive:true});

  const menuBtn = $('.menu-button'), mobileMenu = $('.mobile-menu');
  const setMenu = open => {
    if(!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if(e.key === 'Escape') setMenu(false); });

  if (window.gsap && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.timeline({defaults:{ease:'power3.out'}})
      .from('.hero-title .line>span',{yPercent:110,duration:1.1,stagger:.12})
      .to('.reveal',{opacity:1,y:0,duration:.8,stagger:.12},'-=.55')
      .from('.hero-meta',{y:25,opacity:0,duration:.8},'-=.5');

    $$('.service-card').forEach((card,i)=>gsap.from(card,{scrollTrigger:{trigger:card,start:'top 86%'},y:35,opacity:0,duration:.6,delay:(i%3)*.06}));
    $$('.process-row').forEach(row=>gsap.from(row,{scrollTrigger:{trigger:row,start:'top 90%'},x:-25,opacity:0,duration:.55}));
  } else {
    $$('.reveal').forEach(el => {el.style.opacity=1; el.style.transform='none'});
  }

  /* ----------------------------------------------------------------------
     PROCEDURAL INLINE-FOUR ENGINE
     The model is built from Three.js primitives so the demo has no engine
     photo/model licensing dependency. The page drives a real staged teardown.
  ---------------------------------------------------------------------- */
  const mount = $('#engine-canvas');
  const heroSection = $('#hero');
  const engSection = $('#engineering');
  const chapters = $$('.chapter');

  let renderer, scene, camera, engineGroup, clock;
  let engineZone = 'hero';
  let engineeringProgress = 0;
  let activeChapter = 0;
  let engineParts = {};
  let labelDefs = [];
  let blockMaterial, linerMaterial, readyLight, techRings;
  let blueprintEdgeMaterial, blueprintAccentMaterial;
  let modelMaterials = [];
  let structuralEdges = [];

  const cameraKeys = [
    {p:0.00,pos:[9.1,4.6,14.3],target:[2.0,.15,0]},
    {p:0.15,pos:[8.3,4.0,12.4],target:[2.25,1.4,-.25]},
    {p:0.30,pos:[9.9,4.8,10.8],target:[2.45,2.05,.25]},
    {p:0.45,pos:[10.8,3.8,11.6],target:[2.25,1.15,.1]},
    {p:0.60,pos:[9.7,1.0,11.3],target:[2.2,-.65,.05]},
    {p:0.74,pos:[9.2,2.5,17.8],target:[2.05,.15,0]},
    {p:0.88,pos:[9.0,3.8,15.2],target:[2.0,.1,0]},
    {p:1.00,pos:[9.4,4.4,13.6],target:[1.9,0,0]}
  ];

  const part = (key, obj, explode, start, end, rotation={x:0,y:0,z:0}) => {
    engineParts[key] = {
      obj,
      base: obj.position.clone(),
      baseRot: obj.rotation.clone(),
      explode: new THREE.Vector3(explode.x||0, explode.y||0, explode.z||0),
      explodeRot: new THREE.Vector3(rotation.x||0, rotation.y||0, rotation.z||0),
      start, end,
      amount: 0
    };
    return obj;
  };

  const addMesh = (parent, geometry, material, pos=[0,0,0], rot=[0,0,0]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    parent.add(mesh);
    // Every physical component receives a hidden technical-drawing edge layer.
    // During the teardown these edges fade in and remain visible through the
    // semi-transparent solids, producing the blueprint/cutaway look.
    try {
      const line = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 18),
        material?.userData?.bpAccent ? blueprintAccentMaterial : blueprintEdgeMaterial
      );
      line.renderOrder = 20;
      line.frustumCulled = true;
      mesh.add(line);
      mesh.userData.blueprintLine = line;
    } catch (_) {}
    return mesh;
  };

  const helixGeometry = (radius=.16,height=.55,turns=5,segments=54,tube=.018) => {
    const pts=[];
    for(let i=0;i<=segments;i++){
      const t=i/segments, a=t*Math.PI*2*turns;
      pts.push(new THREE.Vector3(Math.cos(a)*radius,t*height-height/2,Math.sin(a)*radius));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),segments,tube,6,false);
  };

  const sampleCamera = p => {
    let a=cameraKeys[0],b=cameraKeys[cameraKeys.length-1];
    for(let i=0;i<cameraKeys.length-1;i++) if(p>=cameraKeys[i].p && p<=cameraKeys[i+1].p){a=cameraKeys[i];b=cameraKeys[i+1];break;}
    const t=smooth(a.p,b.p,p);
    return {
      pos:a.pos.map((v,i)=>lerp(v,b.pos[i],t)),
      target:a.target.map((v,i)=>lerp(v,b.target[i],t))
    };
  };

  const addEdges = (mesh, color=0x738087, opacity=.22) => {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({color, transparent:true, opacity, depthWrite:false})
    );
    edges.renderOrder = 6;
    edges.userData.baseOpacity = opacity;
    edges.position.copy(mesh.position);
    edges.rotation.copy(mesh.rotation);
    edges.scale.copy(mesh.scale);
    mesh.parent.add(edges);
    structuralEdges.push(edges);
    return edges;
  };

  const createEngine = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(31, innerWidth/innerHeight, .1, 120);
    camera.position.set(9.4,4.4,13.6);

    const compactViewport = matchMedia('(max-width: 760px)').matches;
    const memory = navigator.deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 8;
    const qualityCap = compactViewport ? (memory <= 4 || cores <= 4 ? 1 : 1.15) : (memory <= 4 || cores <= 4 ? 1.2 : 1.5);
    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'high-performance', depth:true, stencil:false});
    renderer.setPixelRatio(Math.min(devicePixelRatio, qualityCap));
    renderer.setSize(innerWidth, innerHeight);
    renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); mount.classList.add('webgl-lost'); });
    renderer.domElement.addEventListener('webglcontextrestored', () => mount.classList.remove('webgl-lost'));
    mount.classList.add('is-loaded');
    renderer.sortObjects = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    if ('toneMapping' in renderer) renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.setAttribute('aria-hidden','true');
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xcad4da, 0x090b0d, 1.05));
    const key = new THREE.DirectionalLight(0xeaf4ff, 2.8); key.position.set(7,10,9); scene.add(key);
    const fill = new THREE.PointLight(0x6b7d87, 1.4, 35); fill.position.set(-6,-1,8); scene.add(fill);
    const acid = new THREE.PointLight(0xc8ff38, 2.3, 26); acid.position.set(-4,4,4); scene.add(acid);
    readyLight = new THREE.PointLight(0xc8ff38, 0, 16); readyLight.position.set(3,1,4); scene.add(readyLight);

    const cast = new THREE.MeshStandardMaterial({color:0x353e43,metalness:.82,roughness:.3});
    const castDark = new THREE.MeshStandardMaterial({color:0x1e2428,metalness:.82,roughness:.38});
    const metal = new THREE.MeshStandardMaterial({color:0x9da8ae,metalness:.96,roughness:.16});
    const brushed = new THREE.MeshStandardMaterial({color:0x69767d,metalness:.94,roughness:.24});
    const black = new THREE.MeshStandardMaterial({color:0x0f1316,metalness:.62,roughness:.42});
    const rubber = new THREE.MeshStandardMaterial({color:0x090b0c,metalness:.05,roughness:.82});
    const green = new THREE.MeshStandardMaterial({color:0xc8ff38,emissive:0x2d4306,emissiveIntensity:.55,metalness:.45,roughness:.28});
    const copper = new THREE.MeshStandardMaterial({color:0xa45f3d,metalness:.84,roughness:.26});
    blockMaterial = new THREE.MeshStandardMaterial({color:0x283036,metalness:.82,roughness:.3,transparent:true,opacity:.9,depthWrite:false});
    linerMaterial = new THREE.MeshStandardMaterial({color:0x9ca7ac,metalness:.92,roughness:.16,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false});

    blueprintEdgeMaterial = new THREE.LineBasicMaterial({color:0xdbe6ea,transparent:true,opacity:0,depthTest:false,depthWrite:false});
    blueprintAccentMaterial = new THREE.LineBasicMaterial({color:0xc8ff38,transparent:true,opacity:0,depthTest:false,depthWrite:false});
    green.userData.bpAccent=true;
    modelMaterials=[cast,castDark,metal,brushed,black,rubber,green,copper,blockMaterial,linerMaterial];
    modelMaterials.forEach(m=>{m.userData.baseOpacity=m.opacity ?? 1; m.transparent=true;});

    engineGroup = new THREE.Group();
    engineGroup.rotation.set(-.1,-.58,.035);
    engineGroup.position.set(2.1,-.28,0);
    scene.add(engineGroup);

    // BLOCK / BORE STRUCTURE -------------------------------------------------
    const blockGroup = new THREE.Group(); blockGroup.position.set(0,-.18,0); engineGroup.add(blockGroup);
    const block = addMesh(blockGroup,new THREE.BoxGeometry(5.75,2.55,3.45),blockMaterial);
    addEdges(block,0x7e8d95,.34);
    const deck = addMesh(blockGroup,new THREE.BoxGeometry(5.9,.18,3.58),cast,[0,1.34,0]); addEdges(deck,0x8d9aa0,.2);
    const railL = addMesh(blockGroup,new THREE.BoxGeometry(5.55,.22,.22),castDark,[0,.45,-1.7]);
    const railR = addMesh(blockGroup,new THREE.BoxGeometry(5.55,.22,.22),castDark,[0,.45,1.7]);
    [-2.05,-.68,.68,2.05].forEach(x=>{
      const liner = addMesh(blockGroup,new THREE.CylinderGeometry(.5,.5,2.22,28,1,true),linerMaterial,[x,.1,0]);
      addMesh(blockGroup,new THREE.TorusGeometry(.51,.035,8,30),brushed,[x,1.22,0],[Math.PI/2,0,0]);
    });
    part('block',blockGroup,{x:0,y:0,z:0},1,1);

    // CYLINDER HEAD ----------------------------------------------------------
    const headGroup = new THREE.Group(); headGroup.position.set(0,1.82,0); engineGroup.add(headGroup);
    const headBody = addMesh(headGroup,new THREE.BoxGeometry(5.85,1.0,3.55),cast);
    addEdges(headBody,0x8c9aa1,.24);
    [-2.05,-.68,.68,2.05].forEach(x=>{
      // spark plug wells and valves
      addMesh(headGroup,new THREE.CylinderGeometry(.11,.11,.82,12),green,[x,.62,0]);
      [-.62,.62].forEach(z=>{
        addMesh(headGroup,new THREE.CylinderGeometry(.085,.085,.68,10),metal,[x,-.27,z]);
        addMesh(headGroup,new THREE.CylinderGeometry(.16,.11,.10,12),brushed,[x,-.62,z]);
      });
    });
    part('head',headGroup,{y:2.35,z:.2},.30,.50,{z:.035});

    // HEAD GASKET / FASTENERS / VALVE SPRINGS -------------------------------
    const gasketGroup = new THREE.Group(); gasketGroup.position.set(0,1.30,0); engineGroup.add(gasketGroup);
    const gasket=addMesh(gasketGroup,new THREE.BoxGeometry(5.78,.055,3.44),copper);
    gasket.scale.set(.985,1,.985);
    [-2.05,-.68,.68,2.05].forEach(x=>addMesh(gasketGroup,new THREE.TorusGeometry(.52,.035,8,28),black,[x,.02,0],[Math.PI/2,0,0]));
    part('gasket',gasketGroup,{y:1.15,z:.35},.34,.52,{z:-.035});

    const springGroup = new THREE.Group(); springGroup.position.set(0,2.02,0); engineGroup.add(springGroup);
    [-2.05,-.68,.68,2.05].forEach(x=>[-.62,.62].forEach(z=>{
      addMesh(springGroup,helixGeometry(.14,.62,5.4,58,.016),metal,[x,0,z]);
      addMesh(springGroup,new THREE.CylinderGeometry(.18,.18,.055,18),brushed,[x,.33,z]);
      addMesh(springGroup,new THREE.CylinderGeometry(.18,.18,.055,18),brushed,[x,-.33,z]);
    }));
    part('springs',springGroup,{y:2.05,z:.8},.21,.40,{x:.05});

    const plugGroup = new THREE.Group(); plugGroup.position.set(0,2.35,0); engineGroup.add(plugGroup);
    [-2.05,-.68,.68,2.05].forEach(x=>{
      addMesh(plugGroup,new THREE.CylinderGeometry(.095,.095,.72,14),new THREE.MeshStandardMaterial({color:0xd9dde0,metalness:.08,roughness:.62,transparent:true}),[x,0,0]);
      addMesh(plugGroup,new THREE.CylinderGeometry(.13,.13,.18,12),metal,[x,-.42,0]);
      addMesh(plugGroup,new THREE.CylinderGeometry(.035,.035,.18,8),metal,[x,-.58,0]);
    });
    part('plugs',plugGroup,{y:2.75,z:-.65},.16,.33,{z:.04});

    const fastenerGroup = new THREE.Group(); fastenerGroup.position.set(0,1.95,0); engineGroup.add(fastenerGroup);
    [-2.65,-1.32,0,1.32,2.65].forEach(x=>[-1.37,1.37].forEach(z=>{
      addMesh(fastenerGroup,new THREE.CylinderGeometry(.075,.075,.92,10),brushed,[x,0,z]);
      addMesh(fastenerGroup,new THREE.CylinderGeometry(.13,.13,.09,6),metal,[x,.50,z]);
    }));
    part('fasteners',fastenerGroup,{y:2.45,z:1.05},.23,.42,{z:-.05});

    // CAMSHAFTS + LOBES ------------------------------------------------------
    const camGroup = new THREE.Group(); camGroup.position.set(0,2.28,0); engineGroup.add(camGroup);
    [-.66,.66].forEach((z,camIndex)=>{
      addMesh(camGroup,new THREE.CylinderGeometry(.14,.14,5.55,20),metal,[0,0,z],[0,0,Math.PI/2]);
      [-2.05,-1.35,-.68,0,.68,1.35,2.05].forEach((x,i)=>{
        const lobe=addMesh(camGroup,new THREE.CylinderGeometry(.24,.16,.11,14),brushed,[x,0,z],[0,0,Math.PI/2]);
        lobe.rotation.x=(i*.72)+(camIndex*.4);
      });
    });
    part('cams',camGroup,{y:3.15,z:.45},.23,.43,{x:.08});

    const camCapsGroup = new THREE.Group(); camCapsGroup.position.set(0,2.47,0); engineGroup.add(camCapsGroup);
    [-2.2,-1.1,0,1.1,2.2].forEach(x=>[-.66,.66].forEach(z=>{
      addMesh(camCapsGroup,new THREE.BoxGeometry(.32,.18,.44),cast,[x,0,z]);
      addMesh(camCapsGroup,new THREE.CylinderGeometry(.045,.045,.28,8),metal,[x,.13,z-.13]);
      addMesh(camCapsGroup,new THREE.CylinderGeometry(.045,.045,.28,8),metal,[x,.13,z+.13]);
    }));
    part('camcaps',camCapsGroup,{y:2.55,z:1.15},.22,.41,{z:.06});

    // VALVE COVER ------------------------------------------------------------
    const valveGroup = new THREE.Group(); valveGroup.position.set(0,2.9,0); engineGroup.add(valveGroup);
    const valveBody = addMesh(valveGroup,new THREE.BoxGeometry(5.25,.48,2.72),black);
    addEdges(valveBody,0x617078,.26);
    [-1.8,-.9,0,.9,1.8].forEach(x=>addMesh(valveGroup,new THREE.BoxGeometry(.08,.18,2.45),cast,[x,.28,0]));
    addMesh(valveGroup,new THREE.CylinderGeometry(.26,.26,.09,24),green,[1.85,.3,-.7],[Math.PI/2,0,0]);
    part('valve',valveGroup,{y:4.4,z:.95},.05,.16,{z:-.06});

    // COIL PACKS -------------------------------------------------------------
    const coilGroup = new THREE.Group(); coilGroup.position.set(0,3.12,0); engineGroup.add(coilGroup);
    [-2.05,-.68,.68,2.05].forEach(x=>{
      addMesh(coilGroup,new THREE.BoxGeometry(.5,.42,.54),black,[x,0,0]);
      addMesh(coilGroup,new THREE.BoxGeometry(.18,.12,.3),green,[x,.25,0]);
    });
    part('coils',coilGroup,{y:5.1,z:1.4},.04,.14,{z:.09});

    // INTAKE + FUEL RAIL -----------------------------------------------------
    const intakeGroup = new THREE.Group(); intakeGroup.position.set(0,1.05,-2.0); engineGroup.add(intakeGroup);
    const plenum=addMesh(intakeGroup,new THREE.BoxGeometry(4.9,.75,.72),castDark,[0,.1,-.2]); addEdges(plenum,0x5d6970,.22);
    [-2.05,-.68,.68,2.05].forEach(x=>{
      const runner=addMesh(intakeGroup,new THREE.TorusGeometry(.76,.11,12,30,Math.PI*.95),cast,[x,-.05,.42],[Math.PI/2,0,-.18]);
      runner.scale.set(.72,1,1);
    });
    const throttle=addMesh(intakeGroup,new THREE.CylinderGeometry(.46,.46,.48,28),metal,[2.65,.12,-.15],[Math.PI/2,0,0]);
    part('intake',intakeGroup,{y:.65,z:-4.25},.09,.25,{x:-.10});

    const fuelGroup = new THREE.Group(); fuelGroup.position.set(0,2.05,-1.68); engineGroup.add(fuelGroup);
    addMesh(fuelGroup,new THREE.BoxGeometry(5.0,.16,.18),metal);
    [-2.05,-.68,.68,2.05].forEach(x=>addMesh(fuelGroup,new THREE.CylinderGeometry(.09,.09,.62,10),copper,[x,-.33,0]));
    part('fuel',fuelGroup,{y:1.55,z:-3.15},.13,.29,{z:-.05});

    // EXHAUST HEADER ---------------------------------------------------------
    const exhaustGroup = new THREE.Group(); exhaustGroup.position.set(0,.92,2.0); engineGroup.add(exhaustGroup);
    [-2.05,-.68,.68,2.05].forEach((x,i)=>{
      const header=addMesh(exhaustGroup,new THREE.TorusGeometry(.78,.1,12,32,Math.PI*1.08),metal,[x,0,-.35],[Math.PI/2,0,.38*(i<2?1:-1)]);
      header.scale.set(.82,1,1);
    });
    addMesh(exhaustGroup,new THREE.CylinderGeometry(.26,.34,4.7,18),brushed,[0,-.92,.86],[0,0,Math.PI/2]);
    part('exhaust',exhaustGroup,{y:.15,z:4.35},.10,.26,{x:.10});

    // TIMING DRIVE -----------------------------------------------------------
    const timingGroup = new THREE.Group(); timingGroup.position.set(3.18,.28,0); engineGroup.add(timingGroup);
    const timingPlate=addMesh(timingGroup,new THREE.BoxGeometry(.22,3.8,2.75),castDark); addEdges(timingPlate,0x6f7a80,.23);
    const gearData=[[0,1.22,-.7,.62],[0,1.22,.7,.62],[0,-1.0,0,.86]];
    gearData.forEach(([,y,z,r])=>{
      addMesh(timingGroup,new THREE.CylinderGeometry(r,r,.28,32),metal,[.18,y,z],[0,0,Math.PI/2]);
      addMesh(timingGroup,new THREE.CylinderGeometry(r*.42,r*.42,.34,24),black,[.34,y,z],[0,0,Math.PI/2]);
    });
    addMesh(timingGroup,new THREE.TorusGeometry(1.58,.055,8,80),green,[.38,.05,0],[0,Math.PI/2,0]);
    part('timing',timingGroup,{x:4.35,y:.45},.25,.48,{z:.10});

    const chainGroup = new THREE.Group(); chainGroup.position.set(3.58,.28,0); engineGroup.add(chainGroup);
    for(let i=0;i<54;i++){
      const a=i/54*Math.PI*2;
      const y=Math.sin(a)*1.62;
      const z=Math.cos(a)*1.05;
      addMesh(chainGroup,new THREE.BoxGeometry(.055,.15,.08),i%2?metal:brushed,[.08,y,z],[a,0,0]);
    }
    part('chain',chainGroup,{x:4.8,y:.55,z:.45},.24,.47,{z:.13});

    const coolingGroup = new THREE.Group(); coolingGroup.position.set(2.92,-.18,1.72); engineGroup.add(coolingGroup);
    addMesh(coolingGroup,new THREE.CylinderGeometry(.44,.44,.34,28),cast,[0,0,0],[0,0,Math.PI/2]);
    addMesh(coolingGroup,new THREE.CylinderGeometry(.22,.22,.46,22),metal,[.18,0,0],[0,0,Math.PI/2]);
    const coolantTube=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,.15,0),new THREE.Vector3(.35,.8,.25),new THREE.Vector3(-.15,1.35,.55)]),28,.085,10,false);
    addMesh(coolingGroup,coolantTube,black);
    part('cooling',coolingGroup,{x:3.9,y:.45,z:2.3},.15,.35,{x:.08});

    // ALTERNATOR / ACCESSORY -------------------------------------------------
    const accessoryGroup = new THREE.Group(); accessoryGroup.position.set(3.2,.1,-1.72); engineGroup.add(accessoryGroup);
    addMesh(accessoryGroup,new THREE.CylinderGeometry(.64,.64,.82,28),brushed,[0,0,0],[0,0,Math.PI/2]);
    addMesh(accessoryGroup,new THREE.CylinderGeometry(.28,.28,.9,24),black,[.08,0,0],[0,0,Math.PI/2]);
    for(let i=0;i<10;i++){
      const a=i/10*Math.PI*2;
      addMesh(accessoryGroup,new THREE.BoxGeometry(.07,.45,.10),metal,[0,Math.cos(a)*.48,Math.sin(a)*.48],[a,0,0]);
    }
    part('accessory',accessoryGroup,{x:4.65,y:-.55,z:-1.55},.12,.31,{y:.14});

    const beltGroup = new THREE.Group(); beltGroup.position.set(3.62,-.05,-.75); engineGroup.add(beltGroup);
    [[0,0,.78],[0,-1.22,.48],[0,.62,-.82]].forEach(([,y,z],i)=>{
      addMesh(beltGroup,new THREE.TorusGeometry(i===0?.72:.46,.045,8,44),rubber,[0,y,z],[0,Math.PI/2,0]);
    });
    part('belt',beltGroup,{x:4.55,y:-.15,z:-1.5},.13,.32,{x:.06});

    const starterGroup = new THREE.Group(); starterGroup.position.set(-3.0,-1.12,1.15); engineGroup.add(starterGroup);
    addMesh(starterGroup,new THREE.CylinderGeometry(.34,.34,1.18,24),black,[0,0,0],[0,0,Math.PI/2]);
    addMesh(starterGroup,new THREE.CylinderGeometry(.2,.2,.58,20),metal,[.63,.24,0],[0,0,Math.PI/2]);
    addMesh(starterGroup,new THREE.CylinderGeometry(.12,.12,.18,14),copper,[.95,.24,0],[0,0,Math.PI/2]);
    part('starter',starterGroup,{x:-3.9,y:-1.25,z:1.8},.47,.68,{z:-.08});

    // PISTONS ----------------------------------------------------------------
    const pistonGroup = new THREE.Group(); pistonGroup.position.set(0,.58,0); engineGroup.add(pistonGroup);
    [-2.05,-.68,.68,2.05].forEach((x,i)=>{
      const pg=new THREE.Group(); pg.position.set(x,0,0); pistonGroup.add(pg);
      addMesh(pg,new THREE.CylinderGeometry(.43,.45,.68,28),metal);
      [.21,.29].forEach(y=>addMesh(pg,new THREE.TorusGeometry(.44,.025,8,30),black,[0,y,0],[Math.PI/2,0,0]));
      addMesh(pg,new THREE.CylinderGeometry(.12,.12,.82,16),brushed,[0,0,0],[0,0,Math.PI/2]);
      pg.userData.index=i;
    });
    part('pistons',pistonGroup,{y:2.55,z:.35},.43,.62);

    // CONNECTING RODS --------------------------------------------------------
    const rodGroup = new THREE.Group(); rodGroup.position.set(0,-.25,0); engineGroup.add(rodGroup);
    [-2.05,-.68,.68,2.05].forEach((x,i)=>{
      const rg=new THREE.Group(); rg.position.set(x,0,0); rodGroup.add(rg);
      addMesh(rg,new THREE.CylinderGeometry(.085,.11,1.25,12),brushed);
      addMesh(rg,new THREE.TorusGeometry(.22,.07,10,22),metal,[0,.64,0],[Math.PI/2,0,0]);
      addMesh(rg,new THREE.TorusGeometry(.29,.085,10,22),metal,[0,-.64,0],[Math.PI/2,0,0]);
      rg.rotation.z=(i%2?.08:-.08);
    });
    part('rods',rodGroup,{y:-.65,z:.95},.49,.68,{z:.10});

    // CRANKSHAFT -------------------------------------------------------------
    const crankGroup = new THREE.Group(); crankGroup.position.set(0,-1.14,0); engineGroup.add(crankGroup);
    const crankShaft=addMesh(crankGroup,new THREE.CylinderGeometry(.19,.19,6.3,24),metal,[0,0,0],[0,0,Math.PI/2]);
    [-2.05,-1.36,-.68,0,.68,1.36,2.05].forEach((x,i)=>{
      addMesh(crankGroup,new THREE.CylinderGeometry(i%2?.48:.58,i%2?.48:.58,.16,26),i%2?brushed:cast,[x,0,0],[0,0,Math.PI/2]);
      if(i<6) addMesh(crankGroup,new THREE.BoxGeometry(.46,.18,.95),cast,[x+.34,(i%2?.18:-.18),0],[0,0,(i%2?.28:-.28)]);
    });
    crankGroup.userData.shaft=crankShaft;
    part('crank',crankGroup,{y:-2.85,z:.55},.53,.72,{x:.10});

    const bearingGroup = new THREE.Group(); bearingGroup.position.set(0,-1.48,0); engineGroup.add(bearingGroup);
    [-2.05,-1.02,0,1.02,2.05].forEach(x=>{
      addMesh(bearingGroup,new THREE.TorusGeometry(.39,.055,10,30,Math.PI),copper,[x,0,0],[0,0,Math.PI/2]);
      addMesh(bearingGroup,new THREE.BoxGeometry(.62,.22,1.0),cast,[x,-.24,0]);
      [-.38,.38].forEach(z=>addMesh(bearingGroup,new THREE.CylinderGeometry(.055,.055,.42,8),metal,[x,-.08,z]));
    });
    part('bearings',bearingGroup,{y:-2.15,z:1.15},.54,.73,{z:.08});

    // OIL PAN ---------------------------------------------------------------
    const panGroup = new THREE.Group(); panGroup.position.set(0,-1.9,0); engineGroup.add(panGroup);
    const pan=addMesh(panGroup,new THREE.BoxGeometry(5.2,.66,3.08),castDark); pan.scale.set(1,.86,1);
    addEdges(pan,0x56636a,.24);
    addMesh(panGroup,new THREE.CylinderGeometry(.12,.12,.12,14),green,[2.05,-.38,1.15],[Math.PI/2,0,0]);
    part('pan',panGroup,{y:-3.55,z:-.55},.42,.60,{x:.05});

    const oilGroup = new THREE.Group(); oilGroup.position.set(1.55,-1.82,-.9); engineGroup.add(oilGroup);
    addMesh(oilGroup,new THREE.CylinderGeometry(.34,.34,.42,24),cast,[0,0,0],[Math.PI/2,0,0]);
    const pickup=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(-.4,-.45,.12),new THREE.Vector3(-1.0,-.72,.45)]),30,.07,10,false);
    addMesh(oilGroup,pickup,metal);
    addMesh(oilGroup,new THREE.CylinderGeometry(.28,.34,.12,22),metal,[-1.08,-.75,.48],[Math.PI/2,0,0]);
    const gallery=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.1,.15,0),new THREE.Vector3(.25,1.1,.1),new THREE.Vector3(-.1,2.0,.2)]),32,.045,8,false);
    addMesh(oilGroup,gallery,green);
    part('oil',oilGroup,{x:1.9,y:-2.1,z:-1.75},.48,.67,{z:-.08});

    // FLYWHEEL ---------------------------------------------------------------
    const flyGroup = new THREE.Group(); flyGroup.position.set(-3.15,-1.1,0); engineGroup.add(flyGroup);
    addMesh(flyGroup,new THREE.CylinderGeometry(1.18,1.18,.3,46),metal,[0,0,0],[0,0,Math.PI/2]);
    addMesh(flyGroup,new THREE.TorusGeometry(.92,.08,12,46),black,[0,0,0],[0,Math.PI/2,0]);
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2;
      addMesh(flyGroup,new THREE.CylinderGeometry(.075,.075,.38,10),black,[0,Math.cos(a)*.66,Math.sin(a)*.66],[0,0,Math.PI/2]);
    }
    part('flywheel',flyGroup,{x:-4.25,y:-.55},.50,.70,{x:.10});

    // FILTER / COOLING DETAILS ----------------------------------------------
    const filterGroup=new THREE.Group(); filterGroup.position.set(-2.35,-.55,-1.78); engineGroup.add(filterGroup);
    addMesh(filterGroup,new THREE.CylinderGeometry(.34,.34,.8,24),black,[0,0,0],[Math.PI/2,0,0]);
    addMesh(filterGroup,new THREE.TorusGeometry(.3,.025,8,24),green,[0,.41,0],[Math.PI/2,0,0]);
    part('filter',filterGroup,{x:-1.55,y:-.85,z:-2.55},.18,.38,{z:-.12});

    const sensorGroup=new THREE.Group(); sensorGroup.position.set(-1.4,.05,1.82); engineGroup.add(sensorGroup);
    addMesh(sensorGroup,new THREE.CylinderGeometry(.15,.15,.22,18),black,[0,0,0],[Math.PI/2,0,0]);
    addMesh(sensorGroup,new THREE.BoxGeometry(.16,.12,.34),green,[0,.18,.08]);
    addMesh(sensorGroup,new THREE.CylinderGeometry(.08,.08,.30,12),black,[2.45,-1.0,-.2],[0,0,Math.PI/2]);
    part('sensors',sensorGroup,{x:-1.65,y:.25,z:2.65},.20,.41,{y:.10});

    const dipstickGroup=new THREE.Group(); dipstickGroup.position.set(-2.58,.25,-1.64); engineGroup.add(dipstickGroup);
    addMesh(dipstickGroup,new THREE.CylinderGeometry(.022,.022,3.05,8),metal,[0,1.15,0],[0,0,-.10]);
    addMesh(dipstickGroup,new THREE.TorusGeometry(.12,.025,8,20),green,[.15,2.68,0]);
    part('dipstick',dipstickGroup,{x:-1.2,y:1.1,z:-2.3},.17,.36,{z:.08});

    // Technical halo removed in V5: it was creating a stray curved line over
    // the hero/teardown sequence and did not add enough value to justify the
    // visual noise.
    techRings = null;
    const grid = new THREE.GridHelper(18,18,0x52616a,0x263138); grid.position.y=-4.45; grid.material.transparent=true; grid.material.opacity=.12; scene.add(grid);

    // Label anchors ----------------------------------------------------------
    labelDefs = [
      ['valve','VALVE COVER','TOP-END SHELL',[1,2]],
      ['coils','IGNITION COILS','SPARK CONTROL',[1]],
      ['intake','INTAKE MANIFOLD','AIR PATH',[1]],
      ['fuel','FUEL RAIL + INJECTORS','FUEL DELIVERY',[1,2]],
      ['exhaust','EXHAUST HEADER','GAS FLOW',[1]],
      ['cooling','WATER PUMP','COOLANT FLOW',[1]],
      ['belt','SERPENTINE DRIVE','ACCESSORY DRIVE',[1]],
      ['plugs','SPARK PLUGS','IGNITION POINT',[2,3]],
      ['cams','DUAL CAMSHAFTS','VALVE TIMING',[2]],
      ['camcaps','CAM CAPS','CAM SUPPORT',[2]],
      ['springs','VALVE SPRINGS','VALVE RETURN',[2,3]],
      ['timing','TIMING GEARS','SYNCHRONIZATION',[2]],
      ['chain','TIMING CHAIN','PHASE CONTROL',[2]],
      ['head','CYLINDER HEAD','COMBUSTION',[2,3]],
      ['gasket','HEAD GASKET','COMBUSTION SEAL',[3]],
      ['pistons','PISTONS + RINGS','COMPRESSION',[3,4]],
      ['rods','CONNECTING RODS','FORCE TRANSFER',[4]],
      ['crank','CRANKSHAFT','ROTATION',[4,5]],
      ['bearings','MAIN BEARINGS','OIL CLEARANCE',[4,5]],
      ['oil','OIL PUMP + PICKUP','LUBRICATION',[4]],
      ['pan','OIL PAN','OIL RESERVOIR',[4]],
      ['flywheel','FLYWHEEL','MOMENTUM',[4]],
      ['starter','STARTER MOTOR','CRANKING',[4]]
    ].map(([key,title,kicker,steps])=>({key,title,kicker,steps,obj:engineParts[key].obj}));

    const labelLayer=document.createElement('div');
    labelLayer.className='engine-label-layer';
    document.body.appendChild(labelLayer);
    labelDefs.forEach(def=>{
      const el=document.createElement('div');
      el.className='engine-label';
      el.innerHTML=`<span></span><div><b>${def.title}</b><small>${def.kicker}</small></div>`;
      labelLayer.appendChild(el);
      def.el=el;
    });

    clock = new THREE.Clock();
  };

  const explodedAmount = (def,p) => smooth(def.start,def.end,p) * (1-smooth(.79,.965,p));

  const applyEngineState = p => {
    if(!engineGroup) return;
    engineeringProgress = clamp(p);

    Object.values(engineParts).forEach(def=>{
      if(def.start===1 && def.end===1) return;
      const a=explodedAmount(def,p);
      def.amount=a;
      def.obj.position.set(
        def.base.x + def.explode.x*a,
        def.base.y + def.explode.y*a,
        def.base.z + def.explode.z*a
      );
      def.obj.rotation.set(
        def.baseRot.x + def.explodeRot.x*a,
        def.baseRot.y + def.explodeRot.y*a,
        def.baseRot.z + def.explodeRot.z*a
      );
    });

    // Blueprint mode: fade the solid castings while revealing technical edge
    // geometry. The drawing is not an image overlay; it is generated from the
    // actual Three.js parts, so every line continues to move with the teardown.
    const blueprint=smooth(.08,.28,p)*(1-smooth(.82,.985,p));
    blueprintEdgeMaterial.opacity=lerp(0,.72,blueprint);
    blueprintAccentMaterial.opacity=lerp(0,.92,blueprint);
    modelMaterials.forEach(m=>{
      const base=m.userData.baseOpacity ?? 1;
      const target=m.userData.bpAccent ? .46 : .18;
      m.opacity=lerp(base,target,blueprint);
    });
    structuralEdges.forEach(line=>{
      const base = line.userData.baseOpacity ?? 0.2;
      line.material.opacity = lerp(base * 0.28, base * 0.9, blueprint);
      line.visible = line.material.opacity > 0.015;
    });
    mount.style.setProperty('--blueprint-opacity',String(blueprint));
    mount.style.setProperty('--blueprint-grid-opacity',String(blueprint*.62));
    mount.classList.toggle('blueprint-active',blueprint>.12);

    const openness=smooth(.24,.61,p)*(1-smooth(.79,.965,p));
    blockMaterial.opacity=Math.min(lerp(.88,.17,openness),lerp(.88,.13,blueprint));
    linerMaterial.opacity=Math.max(lerp(.10,.70,openness),lerp(.10,.48,blueprint));

    const wide=innerWidth>900;
    const explodePeak=smooth(.18,.68,p)*(1-smooth(.81,.97,p));
    engineGroup.scale.setScalar(wide?lerp(.94,.72,explodePeak):lerp(.68,.54,explodePeak));
    engineGroup.position.set(wide?2.65:.9, wide?-.12:-.78, 0);
    engineGroup.rotation.x=lerp(-.10,.035,smooth(.06,.58,p));
    engineGroup.rotation.y=lerp(-.64,-.18,smooth(.07,.67,p)) + smooth(.84,1,p)*.24;
    engineGroup.rotation.z=lerp(.025,-.018,smooth(.16,.70,p));

    const view=sampleCamera(p);
    if(wide){
      camera.position.set(...view.pos);
      camera.lookAt(...view.target);
    }else{
      camera.position.set(view.pos[0]*.73,view.pos[1]+.65,view.pos[2]+4.7);
      camera.lookAt(view.target[0]*.38,view.target[1]-.25,view.target[2]);
    }


    const rebuild=smooth(.84,.985,p);
    readyLight.intensity=rebuild*3.6;
    mount.classList.toggle('is-ready',p>.935);
  };

  const setHeroEngine = () => {
    if(!engineGroup) return;
    Object.values(engineParts).forEach(def=>{
      def.obj.position.copy(def.base);
      def.obj.rotation.copy(def.baseRot);
      def.amount=0;
    });
    blockMaterial.opacity=.88;
    linerMaterial.opacity=.11;
    blueprintEdgeMaterial.opacity=0;
    blueprintAccentMaterial.opacity=0;
    modelMaterials.forEach(m=>m.opacity=m.userData.baseOpacity ?? 1);
    structuralEdges.forEach(line=>{
      const base = line.userData.baseOpacity ?? 0.2;
      line.material.opacity = base * 0.16;
      line.visible = line.material.opacity > 0.015;
    });
    mount.style.setProperty('--blueprint-opacity','0');
    mount.style.setProperty('--blueprint-grid-opacity','0');
    mount.classList.remove('blueprint-active');
    engineGroup.scale.setScalar(innerWidth>760?1:.72);
    engineGroup.position.set(innerWidth>760?2.25:1.25,-.28,0);
    engineGroup.rotation.x=-.1;
    engineGroup.rotation.y=-.58;
    engineGroup.rotation.z=.035;
    camera.position.set(9.4,4.4,13.6);
    camera.lookAt(innerWidth>760?1.7:.7,0,0);
    readyLight.intensity=0;
  };

  const updateLabels = () => {
    if(!camera || !engineGroup || !labelDefs.length) return;
    const allow=engineZone==='engineering' && !reduced;
    const w=innerWidth,h=innerHeight;
    const limit = w <= 760 ? 2 : w <= 1100 ? 4 : 99;
    let shown = 0;
    labelDefs.forEach((def,i)=>{
      const candidate=allow && def.steps.includes(activeChapter) && (engineParts[def.key]?.amount||0)>.24 && shown < limit;
      if(!candidate){def.el.classList.remove('is-visible');return;}
      const v=new THREE.Vector3();
      def.obj.getWorldPosition(v);
      v.project(camera);
      const x=(v.x*.5+.5)*w;
      const y=(-v.y*.5+.5)*h;
      const mobileSafe = w > 760 || y < h * .53;
      const inside=v.z<1 && x>8 && x<w-8 && y>72 && y<h-72 && mobileSafe;
      if(!inside){def.el.classList.remove('is-visible');return;}
      def.el.style.left=`${x}px`;
      def.el.style.top=`${y}px`;
      def.el.classList.toggle('is-left',x>w*(w<=760?.62:.69));
      def.el.classList.add('is-visible');
      shown++;
    });
  };

  const hudStates = [
    ['LOCKED','SYNC','SEALED','DIAGNOSE'],
    ['HOLD','SYNC','SEALED','EXTERNALS'],
    ['INDEX','TDC','OPEN','VALVE TRAIN'],
    ['HOLD','EXTRACT','LIFTED','COMBUSTION'],
    ['OPEN','OUT','OPEN','BOTTOM END'],
    ['TORQUE','SET','SEATING','REBUILD'],
    ['TURN','SYNC','SEALED','ROAD READY']
  ];
  const detailStates = [
    ['FULL ASSEMBLY','ENGINE OVERVIEW · SCALE 1:8'],
    ['AIR / FUEL / ACCESSORIES','EXTERNAL SYSTEMS · EXPLODED'],
    ['DOHC VALVE TRAIN','CAM / SPRING / TIMING DETAIL · 4X'],
    ['CYLINDER + PISTON','COMBUSTION PATH · CUTAWAY · 6X'],
    ['CRANK + LUBRICATION','BEARINGS / OIL PATH · 5X'],
    ['ASSEMBLY SEQUENCE','CLEARANCE / TORQUE / INDEX'],
    ['COMPLETE POWERPLANT','SYSTEM CHECK · READY']
  ];

  const activateChapter = index => {
    activeChapter=clamp(index,0,chapters.length-1);
    chapters.forEach((c,i)=>c.classList.toggle('is-active',i===activeChapter));
    const vals=hudStates[activeChapter]||hudStates[0];
    ['crank','pistons','head','state'].forEach((k,i)=>{
      const el=document.querySelector(`[data-hud="${k}"]`);
      if(el) el.textContent=vals[i];
    });
    const detail=detailStates[activeChapter]||detailStates[0];
    const title=document.querySelector('[data-detail-title]');
    const copy=document.querySelector('[data-detail-copy]');
    if(title) title.textContent=detail[0];
    if(copy) copy.textContent=detail[1];
  };

  const updateSceneFromScroll = () => {
    if(!engineGroup) return;
    const heroR=heroSection?.getBoundingClientRect();
    const engR=engSection?.getBoundingClientRect();
    const inHero=heroR && heroR.bottom>0 && heroR.top<innerHeight;
    const inEngineering=engR && engR.bottom>0 && engR.top<innerHeight;

    if(inEngineering && engR.top<=innerHeight){
      engineZone='engineering';
      mount.classList.remove('is-hero','is-hidden');
      mount.classList.add('is-engineering');
      const total=Math.max(1,engSection.offsetHeight-innerHeight);
      const p=clamp(-engR.top/total);
      applyEngineState(p);
      activateChapter(Math.min(chapters.length-1,Math.floor(p*chapters.length)));
      const progressBar=$('[data-engine-progress]');
      if(progressBar) progressBar.style.height=`${Math.max(3,p*100)}%`;
      const pct=$('[data-hud-percent]');
      if(pct) pct.textContent=`${String(Math.round(p*100)).padStart(2,'0')}%`;
    } else if(inHero){
      if(engineZone!=='hero') setHeroEngine();
      engineZone='hero';
      mount.classList.add('is-hero');
      mount.classList.remove('is-engineering','is-hidden','is-ready');
    } else {
      engineZone='hidden';
      mount.classList.remove('is-hero','is-engineering','is-ready');
      mount.classList.add('is-hidden');
    }
  };

  if(mount && window.THREE){
    createEngine();
    setHeroEngine();
    updateSceneFromScroll();

    let last=0;
    const renderLoop=()=>{
      const dt=Math.min(.04,clock.getDelta());
      const t=clock.elapsedTime;
      if(!reduced){
        if(engineZone==='hero') engineGroup.rotation.y += dt*.082;
        if(engineZone==='engineering'){
          const assembled=1-smooth(.18,.52,engineeringProgress)*(1-smooth(.82,.97,engineeringProgress));
          engineParts.crank.obj.rotation.x = engineParts.crank.baseRot.x + Math.sin(t*.5)*.03*assembled + (engineParts.crank.explodeRot.x||0)*engineParts.crank.amount;
          readyLight.intensity += Math.sin(t*7)*.14*(engineeringProgress>.92?1:0);
        }
      }
      updateLabels();
      if(document.visibilityState === 'visible' && engineZone !== 'hidden') renderer.render(scene,camera);
      last=t;
      requestAnimationFrame(renderLoop);
    };
    renderLoop();

    addEventListener('scroll',updateSceneFromScroll,{passive:true});
    addEventListener('resize',()=>{
      camera.aspect=innerWidth/innerHeight;
      camera.updateProjectionMatrix();
      const compact = innerWidth <= 760;
      const memory = navigator.deviceMemory || 8;
      const cores = navigator.hardwareConcurrency || 8;
      const cap = compact ? (memory <= 4 || cores <= 4 ? 1 : 1.15) : (memory <= 4 || cores <= 4 ? 1.2 : 1.5);
      renderer.setPixelRatio(Math.min(devicePixelRatio,cap));
      renderer.setSize(innerWidth,innerHeight);
      if(engineZone==='hero') setHeroEngine(); else updateSceneFromScroll();
    },{passive:true});
  } else if(mount){
    mount.classList.add('no-webgl','is-loaded');
  }

  // Service catalog stays complete, but filters make it fast to scan.
  $$('.service-filters button').forEach(btn=>btn.addEventListener('click',()=>{
    const category=btn.dataset.serviceFilter;
    $$('.service-filters button').forEach(b=>b.classList.toggle('is-active',b===btn));
    $$('.service-card').forEach(card=>card.classList.toggle('is-filtered',category!=='all' && card.dataset.category!==category));
    if(window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  // Service CTA preselects booking service.
  $$('.service-card button').forEach(btn=>btn.addEventListener('click',()=>{
    const service=btn.closest('.service-card').dataset.service;
    const sel=$('[name="service"]'); if(sel) sel.value=service;
    $('#book').scrollIntoView({behavior:reduced?'auto':'smooth'});
  }));

  // Three-step request form: progressive, mobile-friendly, and server validated.
  const form=$('#booking-form');
  if(form){
    let step=1;
    const progress=$('[data-form-progress]',form);
    const serviceSelect=$('[name="service"]',form);
    const selectedService=$('[data-selected-service]',form);
    const selectedServiceName=selectedService?.querySelector('b');
    const status=$('.form-status',form);

    const updateSelectedService=()=>{
      const value=serviceSelect?.value || '';
      if(selectedService){selectedService.hidden=!value; if(selectedServiceName) selectedServiceName.textContent=value;}
    };
    serviceSelect?.addEventListener('change',updateSelectedService);

    const showStep=n=>{
      $$('.form-step',form).forEach(s=>s.classList.toggle('is-active',Number(s.dataset.formStep)===n));
      step=n;
      if(progress) progress.style.width=`${n/3*100}%`;
      status.className='form-status';
      status.textContent='';
      updateSelectedService();
    };
    const validateStep=n=>{
      const panel=$(`[data-form-step="${n}"]`,form); let good=true;
      $$('input,select,textarea',panel).forEach(el=>{
        if(!el.checkValidity() && good){el.reportValidity();good=false;}
      });
      return good;
    };
    $$('.form-next',form).forEach(btn=>btn.addEventListener('click',()=>{if(validateStep(step))showStep(Math.min(3,step+1))}));
    $$('.form-back',form).forEach(btn=>btn.addEventListener('click',()=>showStep(Math.max(1,step-1))));

    const date=$('[name="preferred_date"]',form);
    const toLocalISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if(date){
      const d=new Date(); d.setDate(d.getDate()+1); date.min=toLocalISO(d);
      date.addEventListener('change',()=>{
        const wrap=date.closest('label'); wrap?.querySelector('.field-error')?.remove();
        if(!date.value) return;
        const chosen=new Date(`${date.value}T12:00:00`);
        const weekend=chosen.getDay()===0||chosen.getDay()===6;
        date.setCustomValidity(weekend?'Century Automotive is closed Saturday and Sunday. Choose a weekday.':'');
        if(weekend){const err=document.createElement('p');err.className='field-error';err.textContent='The shop is closed weekends — choose Monday through Friday.';wrap?.appendChild(err);}
      });
    }

    // Keep the selected service when a service card sends the visitor to booking.
    $$('.service-card button').forEach(btn=>btn.addEventListener('click',()=>setTimeout(updateSelectedService,0)));

    form.addEventListener('submit',async e=>{
      e.preventDefault(); if(!validateStep(3)) return;
      if(date && !date.checkValidity()){date.reportValidity();return;}
      const submit=$('.submit-button',form);
      submit.classList.add('loading'); submit.disabled=true;
      const data=Object.fromEntries(new FormData(form).entries());
      try{
        const controller=new AbortController();
        const timer=setTimeout(()=>controller.abort(),12000);
        const res=await fetch('api/appointments.php',{
          method:'POST', signal:controller.signal,
          headers:{'Content-Type':'application/json','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').content},
          body:JSON.stringify(data)
        });
        clearTimeout(timer);
        const json=await res.json();
        if(!res.ok||!json.ok) throw new Error(json.message||'Could not send request.');
        form.reset(); showStep(1);
        status.className='form-status success';
        status.innerHTML=`Request received. Reference <b>${json.reference}</b>. The shop still needs to confirm your appointment.`;
        status.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
      }catch(err){
        status.className='form-status error';
        status.textContent=err?.name==='AbortError'?'The request took too long. Please try again or call the shop.':(err.message||'Something went wrong. Please call the shop.');
      }finally{
        submit.classList.remove('loading'); submit.disabled=false;
      }
    });
    showStep(1);
  }
})();
