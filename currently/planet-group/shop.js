var i=0;
let shop = [
    [
      'milkplanet',
      'milk',
      '東京都新宿区歌舞伎町１丁目１３−４歌舞伎町ＮＮビルB1F',
      '03-6205-9830',
      'http://milk-planet.com/'
    ],
    [
      'CyBARplanet',
      'cybar',
      '東京都新宿区歌舞伎町2-38-9 三星ビルB1F',
      '03-6681-9471',
      'https://milk-planet.com/shop/cybarshinjuku/'
    ],
    [
      'chocolatplanet',
      'chocolat',
      '東京都新宿区歌舞伎町1-2-14コリンズ15ビル7FA号',
      '03-6380-2766',
      'https://milk-planet.com/shop/chocolat/'
    ],
    [
      'chocolatplanet-hanare-',
      'cphanare',
      '東京都新宿区歌舞伎町1-2-14コリンズ15ビル3F',
      '03-6380-2766',
      'https://milk-planet.com/shop/chocolat/'
    ],
    [ 
      'Shandy Love',
      'shandy',
      '東京都新宿区歌舞伎町1-4-12ミヤタビル３F',
      '03-6388-1917',
      'http://milk-planet.com/shop/shandy/'
    ],
    [ 
      'MeltyMousse',
      'melty',
      '東京都新宿区歌舞伎町2-38-9 三星ビル1F',
      '03-6682-0786',
      'https://milk-planet.com/shop/melty/'
    ],
    [ 
      'BloodySugar',
      'bloody',
      '大阪府大阪市中央区心斎橋筋2-3-7ロイヤル北川2F',
      '06-7410-4403',
      'https://milk-planet.com/shop/bloody/'
    ],
    [
      'Royal♡Sugar',
      'roysuga',
      '福岡県福岡市中央区舞鶴1-8-38 WAVE BLDG 2F 205号',
      '092-233-4888',
      'http://milk-planet.com/shop/roysuga/'
    ],
    [
      'Tweeny Heart Cafe',
      'tweeny',
      '福岡県福岡市今泉2-4-23 ぴっぴーハウス3F',
      '092-734-4511',
      'http://milk-planet.com/shop/tweeny/'
    ],
    [ 
      'CyBARplanet-Bangkok-',
      'cybarb',
      '7th Fl. MBK Center Phayathai Rd., Pathumwan Bangkok 10330F',
      '',
      'http://milk-planet.com/shop/cybarbkk/'
    ],
    [ 
      'CyBARplanet-Bangkok 2nd-',
      'cybarb2',
      '2th Fl.706/1 Sukhumvit Rd.Khlong Tan,Khlong Toei Bangkok',
      '',
      'https://milk-planet.com/shop/cybarbkk2//'
    ],
    [ 
      'CyBARplanet-lao-',
      'cybarl',
      'Ban sithannua,Sikhottabong District,Vientiane',
      '020-5721-0090',
      'http://milk-planet.com/shop/cybarlaos/'
    ],
    [
      'planet planet',//店舗名
      'planetplanet',//店舗画像ファイル名.jpg
      '東京都新宿区歌舞伎町2-19-17 石川ビルB1F',//住所
      '03-6233-8564</a>',//電話番号
      'https://planet-planet.amebaownd.com/'//HP URL
    ]
  ];



 for(i=0;i<shop.length;i++){
          document.write(
            '<h3>'+shop[i][0]+'</h3>'+
            '<img src="./images/'+shop[i][1]+
            '.jpg" data-aos="fade-up" data-aos-delay="200" data-aos-anchor-placement="bottm-bottom">'+
            '<div class="file">'+
            '<table><tbody><tr><th>住所</th><td>'+shop[i][2]+'</td></tr>'+
            '<tr><th>電話</th><td><a href="tel:'+shop[i][3]+'">'+shop[i][3]+'</a></td></tr>'+
            '<tr><th>HP</th><td><a href="'+shop[i][4]+'">'+shop[i][4]+'</a></td></tr></tbody></table></div>'
          );
 }
















































