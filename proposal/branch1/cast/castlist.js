const area = ['shandy','shinjuku','chocolat','melty','roysuga','tweeny'];
var i=j=k=0;
const position = ['ten','ften'];
let cast = [
[//shandy cast
    ['au','あぅ','ausan_0x','9.24'],
    ['mars','まぁず','mqrs168','8.26'],
    ['pocha','ぽちゃ','pochan_poyo','3.12'],
    ['mirai','七楽みらい','_michan1_','3.11'],
    ['nekopo','ねこぽ','nekoponopo','5.1'],
    ['shino','世紀末しの','hqrapecom','8.10'],
    ['chiroru','ちろる','sm41388153','4.7'],
    ['maika','まいか','ice_rny','10.15'],
    ['karin','カリン','akanboukarin','7.23'],
    ['ririka','兎姫りりか','usagi_ririka','1.5'],
    ['kyope','きょぺ','kyopp_e','12.1'],
    ['yuika','ゆいか','xvnql_','9.1'],
    ['marin','まりん','_marinchans','1.12'],
    ['marutan','まるたん','maruta_po','9.18'],
    ['nyanmona','にゃんもな','uxvqc','2.14'],
    ['kyu-tama','きゅーたま','9qtama','1.26'],
    ['kanau','かなう','00w_n','7.14'],
    ['tamu','タム','tamu_tamu_o_','4.19'],
    ['hana','はな','hana_v2_','7.27'],
    ['moe','もえ','moe_nya__','8.25'],
    ['kudou','くどう','okashiisseigi','10.22'],
    ['maria','まりあ','_xo10ox','10.25'],
    ['ramu','らむ','ramu_chan104','10.12'],
    ['miyu','みゆ','michan_dayooon','12.30'],
    ['yanyan','やんやん','yan_happy_yan','3.3'],
    ['oyu','おゆ','oyu_nyan_','1.27'],
    ['tarupi','たるぴ','pmhamchi','5.15'],
    ['yurino','ゆりの','saikyou_yellow','9.17'],
    ['kamuko','かむこ','@kamukochan','3.19'],
    ['yunon','ゆのん','yunonUx_xU','11.28'],
    ['runya','るにゃ','p_olsk','2.1'],
    ['riyu','りゆ','necopimaru','12.4'],
    ['ino','いの','xamzii_','12.16'],
    ['hachi','はち','wan8_888','12.28'],
    ['luna','るな','_runachanman_','10.7']

  ],

[//shinjuku cast
  ['buchan','ぶちゃん','bIlIo_oI','4.30'],
  ['amachi','あまち','Amachi_chan_','4.13'],
  ['iru','いる','D7jXn','3.25'],
  ['pome','ぽめ','pomenyan_ko','4.18'],
  ['mipo','みぽ','mipochimilk','8.14'],
  ['jyuri','じゅり','jurichance3','10.17'],
  ['minatsu','みなつ','minaaaatan','8.6'],
  ['sham','しゃむ','px_xq__m','3.15'],
  ['nana','なな','nyanya_ooo_','4.28'],
  ['noachi','のあち','gjmbnc','12.7'],
  ['mero','めろ','mero_dayoo','6.23'],
  ['nene','ねね','_neneranian','11.20'],
  ['ina','いな','yina_t0','1.31'],
  ['uki','うき','uuuuki_TxT','12.26'],
  ['jusui','じゅすい','jusui_x_x','11.16'],
  ['sana','さな','u_u_Etoile','3.29'],
  ['usami','うさみ','pyon3desu_','11.4'],
  //['namu','なむ','76_chocopla','11.25'],
  ['negi','ねぎ','supobobitti_17','9.8'],
  ['hagumi','はぐみ','hagudayo','1.4'],
  ['iori','いおり','i0rioiori','6.24'],
  ['miya','みや','miyachan_5done','6.7'],
  ['rieru','りえる','rierknxu_','9.11'],
  ['nemu','ねむ','nemu_planet','6.2'],
  ['amiri','あみり','xxv_rx','3.22'],
  ['shuna','しゅな','shunamon_planet','3.10'],
  ['cocoro','こころ','_cocomelody','4.14'],
  ['soa','そあ','nyansoa','8.28'],
  ['hairu','はいる','ha_iru_oo','1.19'],
  ['key','きい','key_7119','8.21'],
  ['neno','ねの','NENO_cule','8.5'],
  ['momo','もも','nyan3desu_','3.2'],
  ['amu','あむ','amuamuamuamu_oO','4.5'],
  ['meru','める','psychonyanko'],
  ['sono','その','ss__n442'],
  ['rinka','りんか','rinkaa__00'],
  ['inori','いのり','mlpl_inori']
],

 [//chocolat cast
  ['umi','うみ','umi_milkyway','2.15'],
  ['tamate','たまて','tamatepl','3.29'],
  ['iori','いおり','i0rioiori','6.24'],
  ['minatsu','みなつ','_minatsuplanet_','8.6'],
  ['serina','セリナ','Seri_o2'],
  ['mui','むい','nekouzumui__','12.16'],
  ['ruu','るぅ','ruu_uoxo','1.21'],
  ['mian','みあん','xx_mian'],
  ['mami','まみ','minmin__nyan','8.24'],
  ['amachi','あまち','Amachi_chan_','4.13'],
  ['hagumi','はぐみ','hagudayo','1.4'],
  ['misa','みさ','msmsxkumachan','12.15'],
  ['rao','らお','choco_p_raokun','12.2'],
  ['miu','みう','ruri_pina1'],
  ['ina','いな','yina_t0','1.31']
],

[//melty
  ['mirai','みらい','_michan1_','3.11'],
  ['suzu','すず','z__oym','6/11'],
  ['ruachipoyo','るあちぽよ','nyanpoy0','5.10'],
  ['nyutan','にゅたん','usrchu','1.8'],
  ['saga','サガ','L_lamalamasan','11.25'],
  ['momorin','ももりん','mm___u3','5.8'],
  ['yuchima','ゆちま','yu1515WW_','1.5'],
  ['syu','しゅう','furohaire_kusai','10.22'],
  ['kanonchima','かのんちま','','9.25'],
  ['ami','あみ','ami2yancosan','12.10'],
  ['bibi','びび','b1b1_o','5.7'],
  ['manachan','まなちゃん','HAMUO3_','3.26'],
  ['kuara','くあら','_9arall','10.8']

],

[//roysuga cast
  ['nanapink','ななぴんく','nanapink_p','12.26'],
  ['momo','もも','momom0_x','1.30'],
  ['new','にゅう','new_yurayura','5.6'],
  ['noel','のえる','meupisama','7.20'],
  ['ichigo','いちご','15_ichigo_nya','1.5'],
  ['tera','てら','Royalsugar_tera','12.26'],
  ['sui','すい','_suicham','11.1'],
  ['rene','ルネ','Rene_xxx_','9.12'],
  ['rei','れい','reinyqn_rs','5.1'],
  ['anna','あんな','ikill_foru','3.6'],
  ['aoi','あおい','aochan_2y','8.26'],
  ['yae','やえ','XyaeX317','3.17'],
  ['shirazu','不知','loluox','9.26'],
  ['yoru','よる','Royal_yoru_','9.12'],
  ['tororo','とろろ芋子','tororo_never2','4.25'],
  ['miru','みる','miru_026','12.26'],
  ['meru','める','meru_meru_0305','12.1'],
  ['shino','しの','sino82_','8.2'],
  ['ribon','りぼん','dollr22','8.29'],
  ['maya','磨','Maya_sugar80','4.1']
],

[//tweeny cast

  ['chanmomo','ちゃんもも','momom0_x','1.30'],
  ['ere','えれ','el_pyoo','5.6'],
  ['rui','るい','gjur6_iiss','3.16'],
  ['sora','そら','sora_tweeny','1.12'],
  ['sakura','さくら','Tweeny_sakura','2.14'],
  ['rei','れい','oirarei','4.28'],
  ['yayoi','やよい','tweeny_yayoi','3.11'],
  ['ririmu','りりむ','ririmu_tweeny','6.25'],
  ['momo','もも','10__mmo','10.10'],
  ['iru','いる','i1ru_0','5.19'],
  ['rinon','りのん','rinonn1213','12.13'],
  ['poyo','ぽよ。','poyochan_chomp','1.24'],
  ['nemu','ねむ','nemu_tweeny','7.3'],
  ['kon','こん','042kn','9.20']
]


];

let max_numcast= max_area(cast);
function max_area(cast){
  let max=0;
  for(i=0;i<cast.length;i++){
    if(max<cast[i].length){
     max=cast[i].length;
    }
  }
  return max;
}


for(k=0;k<position.length;k++){
   for(i=0;i<cast.length;i++){
      for(j=0;j<cast[i].length;j++){
          if(cast[i][j][4]=== position[k]){
          document.write('<div class="all '+area[i]+' '+cast[i][j][4]+'"><li><img src="./'+area[i]+'/'+cast[i][j][0]+'.jpg"><p>'+cast[i][j][1]+
          '<a href="https://twitter.com/'+cast[i][j][2]+'"></a><br>Birth '+cast[i][j][3]+'</br></p></li></div>');
          }
      }
   }
 }
 j=0;
 for(i=0;i<cast.length;i++){
    for(j;j<max_numcast;j++){
        if(typeof cast[i][j]=== "undefined"){}
        else if(typeof cast[i][j][4]=== "undefined"){
          document.write('<div class="all '+area[i]+' '+cast[i][j][4]+'"><li><img src="./'+area[i]+'/'+cast[i][j][0]+'.jpg"><p>'+cast[i][j][1]+
          '<a href="https://twitter.com/'+cast[i][j][2]+'"></a><br>Birth '+cast[i][j][3]+'</br></p></li></div>');
        }
        if(j%2==1){
          if(i+1==cast.length){
            i=0;
          }
          else{
            j--;
            break;
          }
        }
    }
 }
