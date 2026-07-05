var urlHash = location.hash;

// デフォルトで #shandy を表示
if (!urlHash || urlHash === '#') {
  location.hash = '#shandy';
  urlHash = '#shandy';
}

if(urlHash){
  var element;
  if (urlHash == '#shandy'){
    element = document.getElementById("select_shandy");
  }
  if (urlHash == '#shinjuku'){
    element = document.getElementById("select_shinjuku");
  }
  if (urlHash == '#chocolat'){
    element = document.getElementById("select_cp");
  }
  if (urlHash == '#melty'){
    element = document.getElementById("select_melty");
  }
  if (urlHash == '#roysuga'){
    element = document.getElementById("select_roysuga");
  }
   if (urlHash == '#tweeny'){
    element = document.getElementById("select_tweeny");
  }

  if (element) {
    element.click();
  
    // フィルター処理の後に表示（少し遅らせると完璧）
    setTimeout(() => {
      document.getElementById("boxes").style.visibility = "visible";
    }, 10); // 10ms 後に表示
  }
}