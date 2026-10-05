/* V25: positions follow the 16 newly illustrated 1536 × 1024 scenes.
   Coordinates are percentages, so images and touch targets scale together. */
window.SUNNY_SCENES = (() => {
  const node=(en,vi,box,label,shape='round',extra={})=>({en,vi,box,label,shape,...extra});
  const definitions=[
    ['breeze',[
      node('ball','quả bóng',[47.5,73,14,20],[54,95],'ellipse'),
      node('bike','xe đạp',[73,50,26,39],[86,91]),
      node('book','quyển sách',[12,52,16,16],[19,71]),
      node('Bill','bạn Bill',[56,31,15,47],[64,29],'round',{name:true})
    ]],
    ['warm',[
      node('cake','bánh ngọt',[22,20,21,18],[32,18]),
      node('car','ô tô đồ chơi',[67,77,19,15],[75,95]),
      node('cat','con mèo',[1,47,29,43],[16,94]),
      node('cup','cái chén',[57,27,13,13],[63,25])
    ]],
    ['breeze',[
      node('apple','quả táo',[5,30,13,20],[13,53],'ellipse'),
      node('bag','cái túi',[19,54,25,42],[33,95]),
      node('can','lon đồ uống',[35,31,8,19],[39,28]),
      node('hat','cái mũ',[59,10,36,34],[78,10])
    ]],
    ['warm',[
      node('desk','bàn học',[1,35,45,41],[24,45]),
      node('dog','con chó',[46,54,39,35],[66,94]),
      node('door','cánh cửa',[82,1,16,49],[88,17]),
      node('duck','con vịt',[88,48,10,14],[92,66],'ellipse')
    ]],
    ['steam',[
      node('chicken','thịt gà',[1,62,27,23],[14,90]),
      node('chips','khoai tây chiên',[29,62,22,23],[40,90]),
      node('fish','cá',[52,66,33,20],[67,91]),
      node('milk','sữa',[87,55,11,29],[92,51])
    ]],
    ['warm',[
      node('bell','cái chuông',[87,2,12,28],[90,33]),
      node('pen','bút mực',[4,73,44,13],[26,92]),
      node('pencil','bút chì',[51,76,47,13],[76,93]),
      node('red','màu đỏ',[6,8,18,25],[15,5])
    ]],
    ['breeze',[
      node('garden','khu vườn',[1,27,40,62],[24,64]),
      node('gate','cái cổng',[84,12,15,44],[90,14]),
      node('girl','cô bé',[41,10,23,72],[54,37]),
      node('goat','con dê',[68,43,31,48],[82,94])
    ]],
    ['breeze',[
      node('hair','tóc',[3,18,40,65],[13,22],'polygon',{points:[[5,32],[14,18],[30,15],[38,25],[41,52],[43,78],[32,78],[34,60],[35,46],[30,30],[22,23],[15,29],[11,44],[10,60],[13,76],[3,79],[1,62]]}),
      node('head','đầu',[13,22,23,34],[27,56],'ellipse'),
      node('hand','bàn tay',[43,26,13,21],[53,22]),
      node('horse','con ngựa',[59,4,40,86],[82,93])
    ]],
    ['warm',[
      node('clocks','những cái đồng hồ',[2,3,34,29],[19,35]),
      node('locks','những ổ khóa',[3,47,36,23],[22,72]),
      node('mops','những cây lau nhà',[54,13,25,76],[64,91]),
      node('pots','những cái nồi',[81,43,18,46],[89,95])
    ]],
    ['breeze',[
      node('mango','quả xoài',[3,43,28,27],[17,73],'ellipse'),
      node('monkey','con khỉ',[12,3,30,30],[32,36]),
      node('mother','mẹ',[77,18,22,68],[88,19]),
      node('mouse','con chuột',[46,70,17,21],[55,94])
    ]],
    ['breeze',[
      node('bus','xe buýt',[1,24,58,51],[27,58]),
      node('running','đang chạy',[69,45,19,37],[79,86],'round',{base:'run',ipa:'/ˈrʌnɪŋ/'}),
      node('sun','mặt trời',[27,2,9,13],[32,20],'ellipse'),
      node('truck','xe tải',[64,22,24,17],[78,43])
    ]],
    ['water',[
      node('lake','hồ nước',[1,23,64,31],[32,37]),
      node('leaf','lá cây',[40,74,29,20],[55,96]),
      node('lemons','những quả chanh',[2,59,33,23],[18,57]),
      node('Lucy','bạn Lucy',[65,3,31,83],[84,42],'round',{name:true})
    ]],
    ['steam',[
      node('bananas','những quả chuối',[2,60,33,27],[17,92]),
      node('noodles','mì',[37,40,32,39],[51,83]),
      node('nuts','hạt lạc',[72,63,26,30],[85,96]),
      node('Nick','bạn Nick',[46,5,25,35],[62,5],'round',{name:true})
    ]],
    ['magic',[
      node('teddy bear','gấu bông',[1,12,28,50],[18,65]),
      node('tiger','con hổ',[74,8,25,38],[85,49]),
      node('top','con quay',[38,45,24,42],[52,91]),
      node('turtle','con rùa',[72,54,27,26],[87,83])
    ]],
    ['breeze',[
      node('face','khuôn mặt',[11,23,17,27],[22,20],'ellipse'),
      node('father','bố',[62,2,37,66],[86,46]),
      node('foot','bàn chân',[17,80,16,14],[20,96]),
      node('football','quả bóng đá',[39,69,20,28],[51,67],'ellipse')
    ]],
    ['bubbles',[
      node('washing','đang lau, rửa',[26,12,11,21],[33,9],'round',{base:'wash',ipa:'/ˈwɒʃɪŋ/'}),
      node('water','nước',[68,62,22,12],[82,59],'ellipse',{thumbBox:[67,62,23,31]}),
      node('window','cửa sổ',[12,1,30,59],[20,54],'polygon',{points:[[12,1],[26,1],[26,12],[24,31],[37,35],[42,37],[42,59],[12,59]]}),
      node('Wendy','bạn Wendy',[42,12,22,78],[53,56],'round',{name:true})
    ]]
  ];
  return Object.fromEntries(definitions.map(([ambience,nodes],i)=>['u'+(i+1),{image:'book/illustrated/unit-'+(i+1)+'.webp',width:1536,height:1024,ambience,nodes:nodes.map((n,index)=>({...n,id:'item-'+index}))}]));
})();
