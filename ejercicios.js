/* Base de datos de ejercicios para la calculadora de volumen.
   Formato de cada línea: "Nombre;códigos" donde cada código es grupo+factor.
   Factor 1 = músculo principal (la serie cuenta entera), .5 = secundario (media serie). */
window.MUSCLE_GROUPS=[
  {k:'pe',n:'Pecho',c:'#ff5a5a'},
  {k:'do',n:'Dorsal / espalda',c:'#4da3ff'},
  {k:'tr',n:'Trapecio y espalda alta',c:'#6c8cff'},
  {k:'da',n:'Deltoides anterior',c:'#ff8a3d'},
  {k:'dl',n:'Deltoides lateral',c:'#ffa94d'},
  {k:'dp',n:'Deltoides posterior',c:'#e0743a'},
  {k:'bi',n:'Bíceps',c:'#2fe0d0'},
  {k:'tc',n:'Tríceps',c:'#ffd84d'},
  {k:'an',n:'Antebrazo',c:'#9ad97a'},
  {k:'cu',n:'Cuádriceps',c:'#3ddc84'},
  {k:'gl',n:'Glúteo',c:'#ff4fa3'},
  {k:'is',n:'Isquiotibiales',c:'#b67cff'},
  {k:'ad',n:'Aductores',c:'#d98cff'},
  {k:'ge',n:'Gemelos',c:'#5fd3a3'},
  {k:'ab',n:'Abdomen',c:'#c9cdd4'},
  {k:'lu',n:'Lumbares',c:'#ffb020'},
];

window.EJERCICIOS=`
Press de banca con barra;pe1 tc.5 da.5
Press de banca con mancuernas;pe1 tc.5 da.5
Press inclinado con barra;pe1 da.5 tc.5
Press inclinado con mancuernas;pe1 da.5 tc.5
Press declinado con barra;pe1 tc.5
Press declinado con mancuernas;pe1 tc.5
Press de banca en multipower;pe1 tc.5 da.5
Press inclinado en multipower;pe1 da.5 tc.5
Press en máquina (chest press);pe1 tc.5 da.5
Press inclinado en máquina;pe1 da.5 tc.5
Press Hammer Strength;pe1 tc.5 da.5
Press de suelo (floor press);pe1 tc.5
Press con mancuernas agarre neutro;pe1 tc.5 da.5
Press landmine;pe1 da.5 tc.5
Press Svend;pe1
Aperturas con mancuernas;pe1 da.5
Aperturas inclinadas con mancuernas;pe1 da.5
Aperturas en máquina (pec deck / contractora);pe1
Cruces en polea alta;pe1
Cruces en polea media;pe1
Cruces en polea baja;pe1 da.5
Flexiones;pe1 tc.5 da.5
Flexiones con lastre;pe1 tc.5 da.5
Flexiones declinadas (pies elevados);pe1 da.5 tc.5
Flexiones inclinadas (manos elevadas);pe1 tc.5 da.5
Flexiones con anillas;pe1 tc.5 da.5
Flexiones diamante;tc1 pe.5
Fondos en paralelas (tronco inclinado);pe1 tc.5 da.5
Fondos en máquina asistida;pe1 tc.5 da.5
Pullover con mancuerna;do1 pe.5

Dominadas pronas;do1 bi.5
Dominadas supinas (chin-ups);do1 bi.5
Dominadas agarre neutro;do1 bi.5
Dominadas lastradas;do1 bi.5
Dominadas asistidas (máquina o banda);do1 bi.5
Dominadas negativas;do1 bi.5
Muscle-up;do1 tc.5 pe.5 bi.5
Jalón al pecho agarre ancho;do1 bi.5
Jalón al pecho agarre estrecho;do1 bi.5
Jalón al pecho supino;do1 bi.5
Jalón al pecho agarre neutro;do1 bi.5
Jalón unilateral en polea;do1 bi.5
Jalón en máquina;do1 bi.5
Jalón con brazos rectos (pullover en polea);do1
Pullover en máquina;do1
Remo con barra;do1 tr.5 bi.5 dp.5 lu.5
Remo Pendlay;do1 tr.5 bi.5 lu.5
Remo Yates (agarre supino);do1 bi.5 tr.5
Remo con mancuerna a una mano;do1 bi.5 tr.5
Remo Kroc;do1 bi.5 tr.5 an.5
Remo en polea baja (gironda);do1 tr.5 bi.5
Remo en polea agarre ancho;tr1 do.5 dp.5 bi.5
Remo en polea unilateral;do1 bi.5
Remo en máquina;do1 tr.5 bi.5
Remo en máquina con apoyo en pecho;do1 tr.5 bi.5
Remo en barra T;do1 tr.5 bi.5
Remo Seal;do1 tr.5 bi.5
Remo Meadows;do1 tr.5 bi.5
Remo invertido (australiano);do1 bi.5 tr.5
Remo en banco inclinado con mancuernas;tr1 do.5 dp.5
Remo en multipower;do1 tr.5 bi.5
Remo Hammer Strength;do1 tr.5 bi.5
Encogimientos con barra;tr1 an.5
Encogimientos con mancuernas;tr1 an.5
Encogimientos en máquina;tr1
Encogimientos en multipower;tr1
Face pull;dp1 tr.5
Rack pull;lu1 tr.5 gl.5 an.5
Hiperextensiones (lumbares);lu1 gl.5 is.5
Superman;lu1
Buenos días (good morning);is1 gl.5 lu.5

Press militar con barra de pie;da1 tc.5 dl.5
Press militar sentado con barra;da1 tc.5 dl.5
Press de hombro con mancuernas;da1 tc.5 dl.5
Press de hombro sentado con mancuernas;da1 tc.5 dl.5
Press Arnold;da1 dl.5 tc.5
Press de hombro en máquina;da1 tc.5
Press de hombro en multipower;da1 tc.5
Press tras nuca;da1 dl.5 tc.5
Push press;da1 tc.5 cu.5
Press landmine de pie a una mano;da1 pe.5 tc.5
Flexiones en pica;da1 tc.5
Flexiones en pino (handstand push-up);da1 tc.5
Elevaciones laterales con mancuernas;dl1
Elevaciones laterales sentado;dl1
Elevaciones laterales en polea;dl1
Elevaciones laterales en máquina;dl1
Elevaciones laterales inclinado (lean-away);dl1
Elevaciones laterales con banda;dl1
Elevaciones en Y (Y-raise);dl1 tr.5
Remo al mentón con barra;dl1 tr.5
Remo al mentón en polea;dl1 tr.5
Elevaciones frontales con mancuernas;da1
Elevaciones frontales con disco;da1
Elevaciones frontales en polea;da1
Pájaros con mancuernas (vuelos posteriores);dp1 tr.5
Pájaros en máquina (contractora inversa);dp1 tr.5
Cruces inversos en polea;dp1 tr.5
Remo al cuello en polea alta (rear delt row);dp1 tr.5
Separación de banda (band pull-apart);dp1 tr.5
Rotación externa en polea;dp1

Curl con barra;bi1 an.5
Curl con barra EZ;bi1 an.5
Curl con mancuernas;bi1 an.5
Curl alterno con mancuernas;bi1 an.5
Curl martillo;bi1 an.5
Curl martillo en polea (cuerda);bi1 an.5
Curl cruzado (cross-body);bi1 an.5
Curl concentrado;bi1
Curl predicador con barra EZ;bi1
Curl predicador con mancuerna;bi1
Curl en máquina predicador;bi1
Curl inclinado con mancuernas;bi1
Curl en polea baja;bi1
Curl en polea alta (doble bíceps);bi1
Curl bayesiano en polea;bi1
Curl araña (spider curl);bi1
Curl 21;bi1
Curl Zottman;bi1 an.5
Curl inverso;an1 bi.5
Curl drag;bi1
Curl con banda elástica;bi1

Press francés con barra EZ;tc1
Press francés con mancuernas;tc1
Press francés en polea;tc1
Extensión de tríceps en polea (barra);tc1
Extensión de tríceps en polea (cuerda);tc1
Extensión de tríceps en polea agarre inverso;tc1
Extensión unilateral en polea;tc1
Extensión sobre la cabeza en polea;tc1
Extensión sobre la cabeza con mancuerna;tc1
Extensión sobre la cabeza con barra EZ;tc1
Patada de tríceps con mancuerna;tc1
Patada de tríceps en polea;tc1
Extensión de tríceps en máquina;tc1
Press de banca agarre cerrado;tc1 pe.5 da.5
Press JM;tc1 pe.5
Press Tate;tc1
Fondos en paralelas (tronco vertical);tc1 pe.5 da.5
Fondos en banco;tc1 da.5
Fondos en máquina;tc1 pe.5

Curl de muñeca;an1
Curl de muñeca inverso;an1
Rodillo de muñeca;an1
Paseo del granjero;an1 tr.5 ab.5
Colgarse de la barra (dead hang);an1
Pinza de discos;an1

Sentadilla con barra (barra alta);cu1 gl.5 ad.5
Sentadilla con barra (barra baja);cu1 gl.5 ad.5 lu.5
Sentadilla frontal;cu1 gl.5
Sentadilla goblet;cu1 gl.5
Sentadilla en multipower;cu1 gl.5
Sentadilla hack (máquina);cu1 gl.5
Sentadilla hack inversa;gl1 cu.5
Sentadilla péndulo;cu1 gl.5
Sentadilla en cinturón (belt squat);cu1 gl.5
Sentadilla Zercher;cu1 gl.5 ab.5
Sentadilla a caja (box squat);cu1 gl.5
Sentadilla sumo;cu1 ad1 gl.5
Sentadilla búlgara;cu1 gl.5 ad.5
Sentadilla sissy;cu1
Sentadilla española (con banda);cu1
Sentadilla a una pierna (pistol);cu1 gl.5
Sentadilla con salto;cu1 gl.5
Split squat (zancada estática);cu1 gl.5
Prensa de piernas;cu1 gl.5
Prensa con pies altos;gl1 cu.5 is.5
Prensa horizontal;cu1 gl.5
Prensa unilateral;cu1 gl.5
Extensión de cuádriceps;cu1
Extensión de cuádriceps unilateral;cu1
Zancadas con mancuernas;cu1 gl.5 ad.5
Zancadas con barra;cu1 gl.5 ad.5
Zancadas caminando;cu1 gl.5 ad.5
Zancada inversa;cu1 gl.5
Zancada lateral;cu1 ad.5 gl.5
Zancada en multipower;cu1 gl.5
Subida al banco (step-up);cu1 gl.5
Thruster;cu1 da.5 gl.5 tc.5
Empuje de trineo;cu1 gl.5 ge.5

Hip thrust con barra;gl1 is.5
Hip thrust en máquina;gl1
Hip thrust a una pierna;gl1 is.5
Puente de glúteo;gl1 is.5
Puente de glúteo a una pierna;gl1 is.5
Frog pump;gl1
Patada de glúteo en polea;gl1
Patada de glúteo en máquina;gl1
Abducción de cadera en máquina;gl1
Abducción de cadera en polea;gl1
Caminata lateral con banda;gl1
Pull through en polea;gl1 is.5
Hiperextensión 45° para glúteo;gl1 is.5
Swing con kettlebell;gl1 is.5 lu.5
Peso muerto convencional;gl1 is.5 lu.5 cu.5 tr.5 an.5
Peso muerto sumo;gl1 ad.5 cu.5 is.5 lu.5
Peso muerto con barra hexagonal (trap bar);cu1 gl1 is.5 lu.5 tr.5
Peso muerto rumano con barra;is1 gl1 lu.5
Peso muerto rumano con mancuernas;is1 gl1 lu.5
Peso muerto a una pierna;is1 gl1
Peso muerto con piernas rígidas;is1 gl.5 lu.5
Peso muerto déficit;gl1 is.5 lu.5 cu.5

Curl femoral tumbado;is1
Curl femoral sentado;is1
Curl femoral de pie unilateral;is1
Curl nórdico;is1
Curl femoral con fitball;is1 gl.5
Curl femoral deslizante;is1 gl.5
Glute-ham raise (GHR);is1 gl.5

Aducción de cadera en máquina;ad1
Aducción en polea;ad1
Plancha Copenhague;ad1 ab.5

Elevación de talones de pie;ge1
Elevación de talones sentado;ge1
Elevación de talones en prensa;ge1
Elevación de talones en multipower;ge1
Elevación de talones a una pierna;ge1
Elevación de talones tipo burro;ge1
Saltos a la comba;ge.5

Crunch;ab1
Crunch en polea (de rodillas);ab1
Crunch en máquina;ab1
Crunch inverso;ab1
Crunch bicicleta;ab1
Sit-up (abdominal completo);ab1
Elevación de piernas colgado;ab1 an.5
Elevación de rodillas colgado;ab1
Elevación de piernas tumbado;ab1
Elevación de rodillas en paralelas (silla romana);ab1
Toes to bar;ab1 an.5
Plancha;ab1
Plancha lateral;ab1
Rueda abdominal (ab wheel);ab1
Pallof press;ab1
Giros rusos (russian twist);ab1
Leñador en polea (woodchopper);ab1
Dead bug;ab1
Hollow hold;ab1
Dragon flag;ab1

Cargada de potencia (power clean);tr1 gl.5 cu.5 is.5
Arrancada (snatch);tr1 gl.5 cu.5 da.5
Dos tiempos (clean and jerk);cu1 gl.5 tr.5 da.5 tc.5
Turkish get-up;ab1 da.5 gl.5
Burpees;cu.5 pe.5 tc.5
`.trim().split('\n').filter(l=>l.trim()).map(l=>{
  const [n,c]=l.split(';');
  const m={};
  for(const tok of c.trim().split(/\s+/))m[tok.slice(0,2)]=parseFloat(tok.slice(2));
  return{n:n.trim(),m};
});
