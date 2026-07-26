const STORAGE_KEY = "farmer_collection_register_v1";

let records = [];
let selectedId = null;


const $ = id => document.getElementById(id);


const els = {

search: $("searchInput"),
status: $("statusFilter"),
produce: $("produceFilter"),
reset: $("resetBtn"),

table: $("tableBody"),
empty: $("emptyState"),

count: $("shownCount"),
amount: $("totalAmount"),
paid: $("paidPending"),
kg: $("totalKg"),
display: $("displayCount"),

detail: $("detailPanel"),

form: $("recordForm"),

memberId: $("memberId"),
memberName: $("memberName"),
produceInput: $("produce"),
date: $("date"),
quantity: $("quantityKg"),
rate: $("rate"),
payment: $("paymentStatus"),
preview: $("amountPreview"),

seed: $("seedBtn"),

theme: $("themeBtn")

};





function money(value){

return Number(value || 0)
.toLocaleString(
"en-IN",
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
);

}




function calculate(){

let q = Number(els.quantity.value);

let r = Number(els.rate.value);


if(!q || !r){

els.preview.value="0";

return 0;

}


let total = q*r;

els.preview.value =
money(total);


return Number(total.toFixed(2));

}





function save(){

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(records)
);

}





function loadLocal(){

let data =
localStorage.getItem(STORAGE_KEY);


return data ?
JSON.parse(data)
:
null;

}






async function start(){


let response =
await fetch("data.json");


let seed =
await response.json();



let local =
loadLocal();



records =
local && local.length
?
local
:
seed;



save();



loadProduce();



els.date.value =
new Date()
.toISOString()
.slice(0,10);



events();

render();


}





function loadProduce(){


let list =
[
...new Set(
records.map(
r=>r.produce
)
)
];


list.forEach(p=>{


let option =
document.createElement("option");


option.value=p;

option.textContent=p;


els.produce.appendChild(option);


});


}






function events(){



els.search.oninput=render;

els.status.onchange=render;

els.produce.onchange=render;



els.reset.onclick=()=>{


els.search.value="";

els.status.value="All";

els.produce.value="All";


render();


};




els.quantity.oninput=calculate;

els.rate.oninput=calculate;



els.form.onsubmit=
addRecord;



els.seed.onclick=
reloadData;



if(els.theme){

els.theme.onclick=
toggleTheme;

}




let savedTheme =
localStorage.getItem("theme");


if(savedTheme==="light"){

document.body.classList.add("light");

els.theme.innerHTML="☀️ Bright";

}


}





function filtered(){



let text =
els.search.value
.toLowerCase();



return records.filter(r=>{


let search =

[
r.entry_id,
r.member_id,
r.member_name,
r.produce
]

.join(" ")
.toLowerCase();



return (

(!text || search.includes(text))

&&

(
els.status.value==="All"
||
r.payment_status===els.status.value
)

&&

(
els.produce.value==="All"
||
r.produce===els.produce.value
)

);


});


}






function render(){


let data =
filtered();



els.table.innerHTML="";



data.forEach(r=>{


let tr =
document.createElement("tr");



if(r.entry_id===selectedId)
tr.classList.add("active");



tr.innerHTML=`

<td>${r.entry_id}</td>

<td>

${r.member_name}

<br>

<small>${r.member_id}</small>

</td>


<td>${r.produce}</td>


<td>${r.quantity_kg} kg</td>


<td>₹ ${r.rate}</td>


<td>₹ ${money(r.amount)}</td>


<td>

${r.payment_status}

</td>

`;



tr.onclick=()=>{


selectedId=r.entry_id;

renderDetail(r);

render();


};



els.table.appendChild(tr);


});





els.empty.style.display =
data.length ? "none":"block";




let totalAmount =
data.reduce(
(a,b)=>a+b.amount,
0
);



let totalKg =
data.reduce(
(a,b)=>a+b.quantity_kg,
0
);



let paid =
data.filter(
x=>x.payment_status==="Paid"
).length;



let pending =
data.filter(
x=>x.payment_status==="Pending"
).length;




els.count.textContent=data.length;

els.amount.textContent=
"₹ "+money(totalAmount);


els.paid.textContent=
`${paid} / ${pending}`;


els.kg.textContent=
totalKg;



els.display.textContent=
`Showing ${data.length} Records`;



if(!selectedId && data.length){

selectedId=data[0].entry_id;

}



let selected =
records.find(
x=>x.entry_id===selectedId
);



renderDetail(selected);


}







function renderDetail(r){


if(!r){

els.detail.innerHTML=
"Select a farmer record";

return;

}




let farmer =
records.filter(
x=>x.member_id===r.member_id
);



let totalKg =
farmer.reduce(
(a,b)=>a+b.quantity_kg,
0
);



let totalMoney =
farmer.reduce(
(a,b)=>a+b.amount,
0
);



els.detail.innerHTML=`

<div class="detail-box">

<h2>
${r.member_name}
</h2>

<p>
ID : ${r.member_id}
</p>


<p>
Produce : ${r.produce}
</p>


<p>
Quantity :
${r.quantity_kg} KG
</p>


<p>
Amount :
₹ ${money(r.amount)}
</p>


<p>
Status :
${r.payment_status}
</p>


</div>



<div class="detail-box">

<h3>
Farmer Summary
</h3>


<p>
Total Quantity :
${totalKg} KG
</p>


<p>
Total Value :
₹ ${money(totalMoney)}
</p>


</div>

`;

}





function addRecord(e){

e.preventDefault();



let amount =
calculate();



if(amount<=0){

alert(
"Enter valid quantity and rate"
);

return;

}




let id =
"ENT-"+String(
records.length+1
)
.padStart(3,"0");



let newRecord={


entry_id:id,

member_id:
els.memberId.value.trim(),


member_name:
els.memberName.value.trim(),


produce:
els.produceInput.value.trim(),


quantity_kg:
Number(els.quantity.value),


rate:
Number(els.rate.value),


amount:amount,


date:
els.date.value,


payment_status:
els.payment.value


};



records.unshift(newRecord);


save();



selectedId=id;


els.form.reset();


els.date.value=
new Date()
.toISOString()
.slice(0,10);



render();


alert(
"Farmer record added successfully 🌱"
);


}







async function reloadData(){


let ok =
confirm(
"Reload original data?"
);


if(!ok)return;



let response =
await fetch("data.json");


records =
await response.json();



save();


selectedId=null;


render();


}







function toggleTheme(){


document.body.classList.toggle("light");


let light =
document.body.classList.contains("light");



els.theme.innerHTML =
light
?
"☀️ Bright"
:
"🌙 Dark";



localStorage.setItem(
"theme",
light?"light":"dark"
);


}





start();