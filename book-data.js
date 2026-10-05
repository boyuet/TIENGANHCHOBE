/* Tiếng Anh 1: nội dung chuyển từ sách người dùng cung cấp.
   Listening answers refer to the newly authored spoken prompts, not the CD. */
window.SUNNY_BOOK = (() => {
  const rows = [
    [1,6,'In the school playground','Ở sân trường','B','ball|quả bóng|/bɔːl/;bike|xe đạp|/baɪk/;book|quyển sách|/bʊk/',["Hi, I'm Bill.",'Bye, Bill.'],['Xin chào, mình là Bill.','Tạm biệt, Bill.']],
    [2,9,'In the dining room','Trong phòng ăn','C','cake|bánh ngọt|/keɪk/;car|ô tô|/kɑː/;cat|con mèo|/kæt/;cup|cái chén|/kʌp/', ['I have a car.'],['Mình có một chiếc ô tô.']],
    [3,14,'At the street market','Ở chợ đường phố','A','apple|quả táo|/ˈæpəl/;bag|cái túi|/bæɡ/;can|lon đồ uống|/kæn/;hat|cái mũ|/hæt/', ['This is my bag.'],['Đây là túi của mình.']],
    [4,17,'In the bedroom','Trong phòng ngủ','D','desk|bàn học|/desk/;dog|con chó|/dɒɡ/;door|cánh cửa|/dɔː/;duck|con vịt|/dʌk/', ['This is a dog.'],['Đây là một con chó.']],
    [5,23,'At the fish and chip shop','Ở cửa hàng cá và khoai tây chiên','I','chicken|thịt gà|/ˈtʃɪkɪn/;chips|khoai tây chiên|/tʃɪps/;fish|cá|/fɪʃ/;milk|sữa|/mɪlk/', ['I like milk.'],['Mình thích sữa.']],
    [6,26,'In the classroom','Trong lớp học','E','bell|cái chuông|/bel/;pen|bút mực|/pen/;pencil|bút chì|/ˈpensəl/;red|màu đỏ|/red/', ["It's a red pen."],['Đó là một chiếc bút mực màu đỏ.']],
    [7,31,'In the garden','Trong khu vườn','G','garden|khu vườn|/ˈɡɑːdən/;gate|cái cổng|/ɡeɪt/;girl|cô bé|/ɡɜːl/;goat|con dê|/ɡəʊt/', ["There's a garden."],['Có một khu vườn.']],
    [8,34,'In the park','Trong công viên','H','hair|tóc|/heə/;hand|bàn tay|/hænd/;head|đầu|/hed/;horse|con ngựa|/hɔːs/', ['Touch your hair.'],['Chạm vào tóc của con.']],
    [9,40,'In the shop','Trong cửa hàng','O','clocks|những cái đồng hồ|/klɒks/;locks|những ổ khóa|/lɒks/;mops|những cây lau nhà|/mɒps/;pots|những cái nồi|/pɒts/', ['How many clocks?','Two.'],['Có bao nhiêu cái đồng hồ?','Hai cái.']],
    [10,43,'At the zoo','Ở sở thú','M','mango|quả xoài|/ˈmæŋɡəʊ/;monkey|con khỉ|/ˈmʌŋki/;mother|mẹ|/ˈmʌðə/;mouse|con chuột|/maʊs/', ["That's a monkey."],['Kia là một con khỉ.']],
    [11,48,'At the bus stop','Ở trạm xe buýt','U','bus|xe buýt|/bʌs/;run|chạy|/rʌn/;sun|mặt trời|/sʌn/;truck|xe tải|/trʌk/', ["He's running.","She's running."],['Bạn ấy đang chạy. (nam)','Bạn ấy đang chạy. (nữ)']],
    [12,51,'At the lake','Ở hồ nước','L','lake|hồ nước|/leɪk/;leaf|lá cây|/liːf/;lemons|những quả chanh|/ˈlemənz/', ['Look at Lucy.','Look at the lemons.'],['Nhìn Lucy kìa.','Nhìn những quả chanh kìa.']],
    [13,57,'In the school canteen','Trong căng tin trường','N','bananas|những quả chuối|/bəˈnɑːnəz/;noodles|mì|/ˈnuːdəlz/;nuts|hạt lạc|/nʌts/', ["He's having nuts.","She's having noodles."],['Bạn ấy đang ăn hạt lạc.','Bạn ấy đang ăn mì.']],
    [14,60,'In the toy shop','Trong cửa hàng đồ chơi','T','teddy bear|gấu bông|/ˈtedi beə/;tiger|con hổ|/ˈtaɪɡə/;top|con quay|/tɒp/;turtle|con rùa|/ˈtɜːtəl/', ['I can see a tiger.'],['Mình có thể nhìn thấy một con hổ.']],
    [15,65,'At the football match','Ở trận bóng đá','F','face|khuôn mặt|/feɪs/;father|bố|/ˈfɑːðə/;foot|bàn chân|/fʊt/;football|quả bóng đá, bóng đá|/ˈfʊtbɔːl/', ['Point to your hand.'],['Chỉ vào bàn tay của con.']],
    [16,68,'At home','Ở nhà','W','wash|lau, rửa|/wɒʃ/;water|nước|/ˈwɔːtə/;window|cửa sổ|/ˈwɪndəʊ/', ['How many windows can you see?','I can see six.'],['Con nhìn thấy bao nhiêu cửa sổ?','Mình nhìn thấy sáu cửa sổ.']]
  ];
  const chants = [
    'B, b, ball.\nA ball, a ball.\nB, b, a ball.\nB, b, book.\nA book, a book.\nB, b, a book.\nB, b, bike.\nA bike, a bike.\nB, b, a bike.',
    'C, c, a cup.\nC, c, a cake.\nA cup and a cake.\nC, c, a cat.\nC, c, a car.\nA cat and a car.',
    "A, a, apple.\nA, a, bag.\nThere's an apple\nIn the bag.\nA, a, cat.\nA, a, hat.\nThere's a cat\nOn the hat.",
    'D, d, duck.\nD, d, dog.\nA duck and a dog.\nD, d, door.\nD, d, desk.\nA door and a desk.',
    'I, i, fish.\nI, i, chips.\nFish and chips.\nFish and chips.\nI, i, milk.\nI, i, chicken.\nMilk and chicken.\nMilk and chicken.',
    'E, e, red.\nE, e, pen.\nE, e, a red pen.\nE, e, red.\nE, e, pencil.\nE, e, a red pencil.',
    'G, g, goat.\nG, g, gate.\nA goat and a gate.\nG, g, girl.\nG, g, garden.\nA girl and a garden.',
    "H, h, h.\nHead and hair.\nHoa's head.\nHoa's hair.\nH, h, h.\nHat and hands.\nHoa's hat.\nHoa's hands.",
    'O, o, locks and clocks.\nThere are two locks.\nThere are three clocks.\nO, o, mops and pots.\nThere are four mops.\nThere are five pots.',
    'M, m, m.\nM is for monkey.\nM is for mouse.\nMonkey and mouse.\nM, m, m.\nM is for mother.\nM is for mango.\nMother and mango.',
    'Look at the truck. The truck is moving.\nLook at the bus. The bus is moving.\nLook at the boy. The boy is running.\nThe boy is running in the sun.',
    'L, l, Lucy.\nL, l, lake.\nL, l, lemons.\nLook at Lucy.\nLook at the lake.\nLook at the lemons.',
    "Nam, Nam, Nam.\nNuts, nuts, nuts.\nNam's having nuts.\nNick, Nick, Nick.\nNoodles, noodles, noodles.\nNick's having noodles.",
    'T, t, top.\nT, t, turtle.\nT, t, tiger.\nT, t, teddy bear.\nTony has a top.\nTony has a turtle.\nTony has a tiger.\nTony has a teddy bear.',
    "F, f, face.\nBill has a lovely face.\nF, f, football.\nBill's watching football.\nF, f, father.\nFather's watching football.",
    'W, w, window.\nHow many windows?\nSix or seven.\nW, w, window.\nHow many windows?\nEight, nine or ten.\nSix, seven.\nEight, nine, ten.'
  ];
  const songs = [
    "Hi, I'm Ba.\nHi, I'm Bill.\nHi, Bill. I'm Ba.\nHi, Ba. I'm Bill.",
    'I have a cup.\nI have a car.\nI have a cup and I have a car.\nI have a cake.\nI have a cat.\nI have a cake and I have a cat.',
    "Hi, hi, hi.\nHi, I'm Ann.\nI'm Ann. I'm Ann. I'm Ann.\nThis is my apple.\nThis is my hat.\nThis is my bag.\nThis is my can.",
    "This is a duck.\nIt's on the desk.\nThis is a dog.\nIt's near the door.\nAnd this is a desk.\nIt's near the window.",
    'Fish and chips.\nFish and chips.\nI like fish and chips.\nMilk and chicken.\nMilk and chicken.\nI like milk and chicken.',
    "Hello, I'm Jen. I have a pen.\nIt's red. It's a red pen.\nThis is Ben. He has a pencil.\nIt's red. It's a red pencil.",
    "There's a girl\nIn the garden.\nA girl in the garden.\nA girl in the garden.\nThere's a goat\nIn the garden.\nA goat in the garden.\nA goat in the garden.",
    'Your head and your hair.\nYour head and your hair.\nTouch your head.\nTouch your hair.\nYour hand and your horse.\nYour hand and your horse.\nTouch your hand.\nTouch your horse.',
    'One, two. One, two.\nThere are two clocks.\nTwo, three. Two, three.\nThere are three locks.\nThree, four. Three, four.\nThere are four pots.\nFour, five. Four, five.\nThere are five mops.',
    "Monkey, monkey.\nThat's a monkey.\nMango, mango.\nThat's a mango.\nMother, mother.\nThat's my mother.",
    "It's a sunny day.\nIt's a sunny day.\nIt's a sunny day. It's sunny today.\nThe boy is running.\nThe boy is running.\nThe boy is running in the sun.",
    "Look at Lucy. Look at Lucy.\nLook at Lucy. She's running round the lake.\nLook at the leaf. Look at the leaf.\nLook at the leaf. It's falling to the ground.",
    "There's Nam. There's Nam.\nNam's having nuts.\nHe's having nuts today.\nThere's Nick. There's Nick.\nNick's having noodles.\nHe's having noodles today.",
    "I can see Tony.\nI can see Tony.\nHe's in the toy shop.\nHe's holding a teddy bear.\nI can see a tiger.\nI can see a tiger.\nIt's in the toy shop.\nIt's on the shelf.",
    "That's your face.\nThat's your foot.\nPoint to your face.\nPoint to your foot.\nThat's your hair.\nThat's your head.\nPoint to your hair.\nPoint to your head.",
    "One, two, three, four.\nWendy's at her bedroom door.\nFive, six, seven, eight.\nShe can see a hat on her bed.\nSeven, eight, nine, ten.\nShe can see a cat at the window."
  ];
  const listenPairs = [
    [['ball','bike'],['ball','book']], [['cat','car'],['cup','cake']], [['can','apple'],['bag','hat']], [['dog','duck'],['door','desk']],
    [['chips','fish'],['chicken','milk']], [['bell','pen'],['pen','pencil']], [['garden','gate'],['girl','goat']], [['head','hand'],['horse','hat']],
    [['four clocks','three mops'],['two pots','five locks']], [['monkey','mouse'],['apple','mango']], [['bus','truck'],["He's running.","She's running."]],
    [['lemons','apples'],['leaf','lake']], [['noodles','nuts'],['bananas','nuts']], [['teddy bear','top'],['tiger','turtle']], [['face','foot'],['mother','father']],
    [['six windows','ten lemons'],['seven tops','eight pens']]
  ];
  const gaps = {
    9:[['m_ps','o'],['p_ts','o'],['l_cks','o'],['cl_cks','o']],
    10:[['_ango','m'],['_other','m'],['_onkey','m'],['_ouse','m']],
    11:[['b_s','u'],['tr_ck','u'],['s_n','u'],['r_nning','u']],
    12:[['_ucy','L'],['_ake','l'],['_eaf','l'],['_emons','l']],
    13:[['_ick','N'],['ba_anas','n'],['_oodles','n'],['_uts','n']],
    14:[['_op','t'],['_eddy bear','t'],['_urtle','t'],['_iger','t']],
    15:[['_ather','f'],['_oot','f'],['_ootball','f'],['_ace','f']],
    16:[['_endy','W'],['_ater','w'],['_ashing','w'],['_indow','w']]
  };
  const colors=['#E59200','#DE327A','#008D80','#7951B4'];
  const units=rows.map((r,i)=>({id:'u'+r[0],kind:'unit',number:r[0],page:r[1],pages:[r[1],r[1]+1,r[1]+2],en:r[2],vi:r[3],letter:r[4],color:colors[i%4],words:r[5].split(';').map(x=>{const [en,vi,ipa]=x.split('|');return {en,vi,ipa};}),sentences:r[6].map((en,n)=>({en,vi:r[7][n]})),chant:chants[i].split('\n'),song:songs[i].split('\n'),listen:listenPairs[i].map((options,j)=>({options,target:options[(i+j+1)%2]})),gaps:gaps[r[0]]||[]}));
  const extras = [
    [1,'one','một','/wʌn/',9],[2,'two','hai','/tuː/',9],[3,'three','ba','/θriː/',9],[4,'four','bốn','/fɔː/',9],[5,'five','năm','/faɪv/',9],
    [6,'six','sáu','/sɪks/',16],[7,'seven','bảy','/ˈsevən/',16],[8,'eight','tám','/eɪt/',16],[9,'nine','chín','/naɪn/',16],[10,'ten','mười','/ten/',16]
  ];
  const glossary=units.flatMap(u=>u.words.map(w=>({...w,unit:u.number})));
  // The glossary uses singular clock/lock/mop/pot/banana/lemon/nut.
  const singulars={clocks:['clock','/klɒk/','cái đồng hồ'],locks:['lock','/lɒk/','ổ khóa'],mops:['mop','/mɒp/','cây lau nhà'],pots:['pot','/pɒt/','cái nồi'],bananas:['banana','/bəˈnɑːnə/','quả chuối'],lemons:['lemon','/ˈlemən/','quả chanh'],nuts:['nut','/nʌt/','hạt lạc']};
  glossary.forEach(w=>{if(singulars[w.en]){const [en,ipa,vi]=singulars[w.en];w.en=en;w.ipa=ipa;w.vi=vi;}});
  glossary.push(...extras.map(x=>({en:x[1],vi:x[2],ipa:x[3],unit:x[4]})),{en:'fish and chips',vi:'cá tẩm bột và khoai tây chiên',ipa:'/ˌfɪʃ ən ˈtʃɪps/',unit:5},{en:'hat',vi:'cái mũ',ipa:'/hæt/',unit:3});
  const uniqueGlossary=glossary.filter((w,i,a)=>a.findIndex(x=>x.en===w.en)===i).sort((a,b)=>a.en.localeCompare(b.en));
  const funs = [
    {id:'f1',kind:'fun',number:1,page:12,pages:[12,13],en:'Fun time 1',vi:'Cùng chơi với B và C',letter:'B · C',color:'#007FBB',unitNumbers:[1,2],grid:['bikec','acupp','ballc','carta','bookt'],find:['bike','cup','book','cat','car','ball'],read:[['book','car'],['cake','cup'],['ball','book'],['ball','cat']],readTargets:['book','cup','ball','cat'],play:'Simon says · A happy circle',prompts:['Hi, I’m Bill. I have a cat.','Hi, I’m Ba. I have a car.'],gaps:[]},
    {id:'f2',kind:'fun',number:2,page:29,pages:[29,30],en:'Fun time 2',vi:'Vẽ chữ và đoán từ',letter:'I · E',color:'#007FBB',unitNumbers:[5,6],find:['fish','pen','red','chips','pencil'],chain:'adfishcbpenrdredbchipsicpencilb',gaps:[['ch_ps','i'],['p_nc_l','e|i'],['p_n','e'],['m_lk','i']],play:'Air drawing · Slap the board',prompts:['Draw the letter I.','Draw the letter E.']},
    {id:'f3',kind:'fun',number:3,page:46,pages:[46,47],en:'Fun time 3',vi:'Đếm và ghép hình',letter:'O · M',color:'#007FBB',unitNumbers:[9,10],matches:[['five monkeys','d'],['three clocks','c'],['two locks','b'],['four pots','a']],matchOptions:['four pots','two locks','three clocks','five monkeys'],play:'Simon says · Kim’s game',prompts:['Show me O.','Show me M.'],gaps:[]},
    {id:'f4',kind:'fun',number:4,page:63,pages:[63,64],en:'Fun time 4',vi:'Chiếc túi bí mật',letter:'N · T',color:'#007FBB',unitNumbers:[13,14],gaps:[['__odles','no'],['__ts','nu'],['__ger','ti'],['b__anas','an']],play:'Mystery bag · Pictionary',prompts:['I can see a tiger.','I can see a teddy bear.'],patterns:[['top','teddy bear','top','teddy bear'],['turtle','tiger','turtle','tiger']]}
  ];
  const reviews = [
    {id:'r1',kind:'review',number:1,page:20,pages:[20,21,22],en:'Review 1',vi:'Ôn tập bài 1–4',letter:'B · C · A · D',color:'#7C239E',unitNumbers:[1,2,3,4],story:["Hi! I'm Phonic Phil!","And I'm Super Sue!","Hi! I'm Phil.","Hi! I'm Sue.",'Look! This is my dog.','And this is my cat.','I have a car... and a book.','I have a ball... and a duck.','Oh, no! My cake!'],look:['dog','book','cat','duck'],listen:[['ball','car'],['cat','dog']],letters:[['b','d'],['a','c'],['b','c'],['c','d']],read:[['Hi!','Bye!'],['ball','bike'],['cat','duck'],['cup','can']],targets:['Hi!','ball','duck','can'],gaps:[]},
    {id:'r2',kind:'review',number:2,page:37,pages:[37,38,39],en:'Review 2',vi:'Ôn tập bài 5–8',letter:'I · E · G · H',color:'#7C239E',unitNumbers:[5,6,7,8],story:['Hi, Ben! I have a ball.','And I have a cat.','Hello, Sue and Phil! Look! I have a bag.',"Look out, cat! There's a goat!",'Ha ha.'],look:['bag','goat','ball','gate'],listen:[['goat','gate'],['pencil','pen'],['hand','head']],letters:[['e','i'],['e','g'],['g','h'],['h','d']],read:[['fish','chicken'],['bell','pen'],['milk','can']],targets:['chicken','pen','milk'],grid:['pencil','fishgh','mascaa','igoatn','lepred','kheadb'],find:['fish','gate','goat','hand','head','milk','pencil','red'],gaps:[['_ead','h'],['_ate','g'],['_encil','p'],['_ish','f']]},
    {id:'r3',kind:'review',number:3,page:54,pages:[54,55,56],en:'Review 3',vi:'Ôn tập bài 9–12',letter:'O · M · U · L',color:'#7C239E',unitNumbers:[9,10,11,12],story:['Look at Mary!',"She's running.","And there's a mouse. It's running, too.",'Oh! Run, Phil!'],look:['lemons','mouse','running','sun'],listen:[['bus','truck'],['pots','mops'],['monkey','mouse']],letters:[['m','l'],['u','o'],['m','b'],['u','i']],read:[['mouse','monkey'],['running','standing'],['three pots','three clocks']],targets:['monkey','running','three pots'],grid:['agihskue','ilockseh','lpbvpots','omulakel','stsnfrse','kmouseua','lemonsnf','nostukgh'],find:['bus','lake','leaf','lemons','locks','mouse','pots','sun'],gaps:[['_other','m'],['b_s','u'],['s_n','u'],['tr_ck','u'],['_eaf','l']]},
    {id:'r4',kind:'review',number:4,page:71,pages:[71,72,73],en:'Review 4',vi:'Ôn tập bài 13–16',letter:'N · T · F · W',color:'#7C239E',unitNumbers:[13,14,15,16],story:['Hi, Lucy!','Hello, Phil!','Hi, Nam!','Hello, Sue!','Goodbye!','Bye!','Look! I can see a teddy bear.',"It's Lucy's teddy bear!",'Stop! Lucy! Your teddy bear!'],look:['teddy bear','foot','windows','face'],listen:[['window','turtle'],['tiger','teddy bear'],['head','foot']],letters:[['o','w'],['l','n'],['f','b'],['d','t']],read:[['mother','father'],['six footballs','three footballs'],['door','window']],targets:['father','six footballs','window'],grid:['w r f o o t i'.replace(/ /g,''),'tigerdn','ayfaceu','fathert','windows','turtlek','qwaterg'],find:['face','father','foot','nuts','tiger','turtle','water','window'],gaps:[['_eddy bear','t'],['_iger','t'],['_indow','w'],['_urtle','t'],['_ootball','f']]}
  ];
  reviews.forEach((r,i)=>{r.listen=r.listen.map((options,j)=>({options,target:options[(i+j)%2]}));r.letters=r.letters.map((options,j)=>({options,target:options[(i+j)%2]}));});
  const sequence=[];
  for(let i=0;i<16;i++){sequence.push(units[i]);if([1,5,9,13].includes(i))sequence.push(funs[Math.floor(i/4)]);if([3,7,11,15].includes(i))sequence.push(reviews[Math.floor(i/4)]);}
  const metadata={id:'intro',kind:'intro',en:'Mở đầu & sách gốc',vi:'Bìa, hướng dẫn và mục lục',pages:[1,2,3,4,5,76,77],page:1,color:'#613CE7',words:[]};
  const glossaryEntry={id:'glossary',kind:'glossary',en:'Glossary',vi:'Từ điển của sách',pages:[74,75],page:74,color:'#008D80',words:uniqueGlossary};
  return {version:25,title:'Tiếng Anh 1',units,funs,reviews,glossary:uniqueGlossary,entries:[...sequence,glossaryEntry,metadata],sourcePages:77};
})();
