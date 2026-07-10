var i=j=0;
var eventimage='';
var eventname='';
var eventNum=0;
let sliderepeat = true;
var pathname = location.pathname;
var shopNo =0;
let pass ='../../';
const events = [
    [//all
    //['eventDay','eventName','eventImgName(jpg)']
       ['▶︎▶︎▶︎','&emsp;<a href= "./recruit/" >きゃすと・げすとさん大募集！♡</a>','event0']
      ],

    [//shinjuku
      ['09,19,29','9がつく日はポイント2倍day','event1'],
      ['7.5','ちゃんももゲスト出勤','shinjuku0705']
    ],

    [//cybarshinjuku
      ['7.27','わっちょいさめ誕','cybar0727']
    ], 

    [//chocolat
      ['▶︎▶︎▶︎','7月限定フレーバー','chocolat0700'],
      ['0725','いおり生誕イベント','chocolat0725']
    ],

    [//shandy
      ['▶︎▶︎▶︎','雨の日ポイント2倍','shandy0'],
      ['7.3','りりぃゲスト出勤','shandy0703'],
      ['7.4','りゔゲスト出勤','shandy0704'],
      ['7.9-10','マリンセーラーイベント','shandy0709'],
      ['7.11','かなう生誕イベント','shandy0711'],
      ['7.17','りりかマネージャー昇格','shandy0717'],
      ['7.18','はな生誕卒業イベント','shandy0718'],
      ['7.25','カリン生誕祭','shandy0725']
    ],

    [//melty
    ['7.4','みりあゲスト出勤','melty0704']
    ],

    [//bloody
      ['7.6-7','七夕イベント','bloody0706'],
      ['7.25','ばじる生誕','bloody0725']
    ],

    [//roysuga
      ['7.7-9','マカロンメイドday','roysuga0707'],
      ['7.10','うみうし、佐々木あむ、ねんねゲスト出勤','roysuga0710'],
      ['7.12','ことねゲスト出勤','roysuga0712'],
      ['7.25','のえる生誕祭','roysuga0725']
    ],

    [//tweeny
      ['▶︎▶︎▶︎','平日限定ハッピーアワー','tweenyevent'],
      ['7.7-8','七夕イベント','tweeny0707']

    ],
    [//cybarbkk
    ], 
    [//cybarlaos
    ], 
    [//cybarbkk2
    ]
  ];
switch(pathname){
  case"":
    shopNo = 0;
  break;
  case"/shop/shinjuku/":
    shopNo = 1;
  break;
  case"/shop/cybarshinjuku/":
    shopNo = 2;
	break;
  case"/shop/chocolat/":
    shopNo = 3;
  break;
  case"/shop/shandy/":
    shopNo = 4;
  break;
  case"/shop/melty/":
    shopNo = 5;
  break;
  case"/shop/bloody/":
    shopNo = 6;
  break;
  case"/shop/roysuga/":
    shopNo = 7;
  break;
  case"/shop/tweeny/":
    shopNo = 8;
  break;
  case"/shop/cybarbkk/":
    shopNo = 9;
  break;
  case"/shop/cybarlaos/":
    shopNo = 10;
  break;
  case"/shop/cybarbkk2/":
    shopNo = 11;
  break;
}
//shopNo = 12;

if(shopNo == 0) pass='';
while(sliderepeat===true){
    for(i=0; i<events.length;i++){
          if(shopNo !== 0 && i > shopNo) break;
          eventNum=eventNum+events[i].length;
          for(j=0;j<events[i].length;j++){
              eventimage = eventimage +
                '<li><a href="'+pass+'event/'+events[i][j][2]+
                '.jpg" class="gallery" data-group="gallery"><img src="'+pass+'event/'+events[i][j][2]+'.jpg"></a></li>';
          }
          if(shopNo !== 0 && i!=shopNo) i=shopNo-1;
    }
    if(eventNum >= 4) sliderepeat = false;
}
var eventslider = document.getElementById('eventslider');
eventslider.innerHTML =
'<ul class="slider gallery-list">'+eventimage+'</ul>';


for(j=0;j<events[0].length;j++){
    eventname = eventname +
    '<li><span class="day_event">'+events[0][j][0]+
    '</span>'+events[0][j][1]+'</li>';
}
for(i=0;i<events[shopNo].length;i++){
    eventname = eventname +
    '<li><span class="day_event">'+events[shopNo][i][0]+
    '</span>'+events[shopNo][i][1]+'</li>';
}
var eventtitle = document.getElementById('eventtitle');
eventtitle.innerHTML =
'<ul >'+eventname+'</ul>';



// function showslide(){
//  for(i=0;i<event.length;i++){
//       for(j=0;j<event[i].length;j++){
//           document.write(
//             '<li><a href="event/'+event[i][j]+
//             '.jpg" class="gallery" data-group="gallery"><img src="event/'
//             +event[i][j]+'.jpg"></a></li>'
//           );
//       }
//  }
// }

// showslide();

 // for(i=0;i<event.length;i++){
 //      for(j=0;j<event[i].length;j++){
 //          document.write(
 //            i,j+'<br>'
 //          );
 //      }
 //      document.write('<br>');    
 // }































