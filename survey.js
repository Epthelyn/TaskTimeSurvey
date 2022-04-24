const _surv = function(){

    let agreementScale = [
        "Strongly disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly agree",
    ];
    
    $(document).ready(() => {
        $.ajax({
            url: "data.tsv",
            success: function(data){
               
                
                data = data.split("\r\n");
                data.shift();
                
                for(let i=0; i<data.length; i++){
                    data[i] = data[i].split("\t");
                    // console.log(data[i]);
                }
                
                data = data.map(e => {
                    console.log(e);
                    return {
                        timestamp: e[0],
                        type: e[1],
                        tier: e[2],
                        work: {
                            days: e[3],
                            active: e[4]=="No time"?0:parseInt(e[4][0]),
                            semiActive: e[5]=="No time"?0:parseInt(e[5][0]),
                            inactive: e[6]=="No time"?0:parseInt(e[6][0]),
                        },
                        busy: {
                            days: e[7],
                            active: e[8]=="No time"?0:parseInt(e[8][0]),
                            semiActive: e[9]=="No time"?0:parseInt(e[9][0]),
                            inactive: e[10]=="No time"?0:parseInt(e[10][0]),
                        },
                        free: {
                            days: e[11],
                            active: e[12]=="No time"?0:parseInt(e[12][0]),
                            semiActive: e[13]=="No time"?0:parseInt(e[13][0]),
                            inactive: e[14]=="No time"?0:parseInt(e[14][0]),
                        },
                        otherQuestions: {
                            q1: e[15],
                            q2: e[16],
                            q3: e[17],
                            q4: e[18]
                        }

                    }
                });
                console.log(data);

                let byTier = {};

                data.forEach(entry => {
                    const t = entry.tier;
                    if(!byTier[t]){
                        byTier[t] = [];
                    }

                    byTier[t].push(entry);
                });

                console.log(byTier);

                const tierOrder = ["Beginner","Easy","Medium","Hard","Elite","Master"];

                let output = "";

                tierOrder.forEach(tier => {
                    const results = byTier[tier];

                    let combined = {
                        work: {
                            count: 0,
                            active: {min: Infinity, avg: 0, max: 0},
                            semiActive: {min: Infinity, avg: 0, max: 0},
                            inactive: {min: Infinity, avg: 0, max: 0},
                        },
                        busy: {
                            count: 0,
                            active: {min: Infinity, avg: 0, max: 0},
                            semiActive: {min: Infinity, avg: 0, max: 0},
                            inactive: {min: Infinity, avg: 0, max: 0},
                        },
                        free: {
                            count: 0,
                            active: {min: Infinity, avg: 0, max: 0},
                            semiActive: {min: Infinity, avg: 0, max: 0},
                            inactive: {min: Infinity, avg: 0, max: 0},
                        }
                    }

                    results.forEach(result => {
                        ["work","busy","free"].forEach(x => {
                            if(result[x].days != "None of the above"){
                                combined[x].count++;
                                combined[x].active.avg += result[x].active;
                                combined[x].semiActive.avg += result[x].semiActive;
                                combined[x].inactive.avg += result[x].inactive;

                                if(result[x].active > combined[x].active.max){
                                    combined[x].active.max = result[x].active;
                                }
                                else if(result[x].active < combined[x].active.min){
                                    combined[x].active.min = result[x].active;
                                }

                                if(result[x].inactive > combined[x].inactive.max){
                                    combined[x].inactive.max = result[x].inactive;
                                }
                                else if(result[x].inactive < combined[x].inactive.min){
                                    combined[x].inactive.min = result[x].inactive;
                                }

                                if(result[x].semiActive > combined[x].semiActive.max){
                                    combined[x].semiActive.max = result[x].semiActive;
                                }
                                else if(result[x].semiActive < combined[x].semiActive.min){
                                    combined[x].semiActive.min = result[x].semiActive;
                                }
                            }
                        });
                    });

                    ["work","busy","free"].forEach(x => {
                        combined[x].active.avg = Math.round(10*combined[x].active.avg/combined[x].count)/10;
                        combined[x].semiActive.avg = Math.round(10*combined[x].semiActive.avg/combined[x].count)/10;
                        combined[x].inactive.avg = Math.round(10*combined[x].inactive.avg/combined[x].count)/10;
                    });

                    console.log(tier);
                    console.log(combined);

                    output += `<b><u>${tier}</u></b><br><br>`;

                    ["work","busy","free"].forEach(x => {
                        output+=`<u>${(x=="work"?"Work Days":(x=="busy")?"Other Busy Days":"Free Days")} (${combined[x].count})</u>`;
                        output += `
                            <table>
                                <tr>
                                    <th>Activity Type</th>
                                    <th>Minimum</th>
                                    <th>Average</th>
                                    <th>Maximum</th>
                                </tr>
                                <tr>
                                    <td>Active</td>
                                    <td>${combined[x].active.min}</td>
                                    <td>${combined[x].active.avg}</td>
                                    <td>${combined[x].active.max}</td>
                                </th>
                                <tr>
                                    <td>Semi-Active</td>
                                    <td>${combined[x].semiActive.min}</td>
                                    <td>${combined[x].semiActive.avg}</td>
                                    <td>${combined[x].semiActive.max}</td>
                                </th>
                                <tr>
                                    <td>Inactive/AFK</td>
                                    <td>${combined[x].inactive.min}</td>
                                    <td>${combined[x].inactive.avg}</td>
                                    <td>${combined[x].inactive.max}</td>
                                </th>
                            </table><br>
                        `;

                        
                    });
                   

                    let q1 = {};
                    results.forEach(r => {
                        const q = r.otherQuestions.q1;
                        if(!q1[q]) q1[q] = 0;
                        q1[q]++;
                    });

                    let q1_arr = [];
                    for(k in q1){
                        q1_arr.push({
                            answer: k,
                            count: q1[k]
                        });
                    }

                    console.log(q1_arr);
                    
                    output += `
                        When you have very limited time to actively play but have a task that requires a lot of attention, which of the following are you most likely to do?<br>
                        <table>
                            ${q1_arr.sort((a,b) => a.count - b.count).map(q => {
                                return `
                                <tr>
                                    <td class="answerCell"><b>${q.answer.length > 80?q.answer.substr(0,80)+"...":q.answer}</b></td>
                                    <td class="answerCountCell">
                                        <div class="answerBar" style="width: ${20*q.count}px">${q.count}</div>
                                    </td>
                                </tr>
                                `
                            }).join("")}
                        </table><br>
                    `;

                    let q2 = {
                        "Strongly disagree": 0,
                        "Disagree": 0,
                        "Neutral": 0,
                        "Agree": 0,
                        "Strongly agree": 0,
                    };
                    results.forEach(r => {
                        const q = r.otherQuestions.q2;
                        if(!q2[q]) q2[q] = 0;
                        q2[q]++;
                    });

                    let q2_arr = [];
                    for(k in q2){
                        q2_arr.push({
                            answer: k,
                            count: q2[k]
                        });
                    }

                    console.log(q2_arr);
                    
                    output += `
                        Extra time to Group Activities<br>
                        <table>
                            ${q2_arr.sort((a,b) => agreementScale.indexOf(a.answer) - agreementScale.indexOf(b.answer)).map(q => {
                                return `
                                <tr>
                                    <td class="answerCell"><b>${q.answer.length > 80?q.answer.substr(0,80)+"...":q.answer}</b></td>
                                    <td class="answerCountCell">
                                        <div class="answerBar" style="width: ${20*q.count}px">${q.count}</div>
                                    </td>
                                </tr>
                                `
                            }).join("")}
                        </table><br>
                    `;

                    let q3 = {
                        "Strongly disagree": 0,
                        "Disagree": 0,
                        "Neutral": 0,
                        "Agree": 0,
                        "Strongly agree": 0,
                    };
                    results.forEach(r => {
                        const q = r.otherQuestions.q3;
                        if(!q3[q]) q3[q] = 0;
                        q3[q]++;
                    });

                    let q3_arr = [];
                    for(k in q3){
                        q3_arr.push({
                            answer: k,
                            count: q3[k]
                        });
                    }

                    console.log(q3_arr);
                    
                    output += `
                        Extra time to Solo Activities<br>
                        <table>
                            ${q3_arr.sort((a,b) => agreementScale.indexOf(a.answer) - agreementScale.indexOf(b.answer)).map(q => {
                                return `
                                <tr>
                                    <td class="answerCell"><b>${q.answer.length > 80?q.answer.substr(0,80)+"...":q.answer}</b></td>
                                    <td class="answerCountCell">
                                        <div class="answerBar" style="width: ${20*q.count}px">${q.count}</div>
                                    </td>
                                </tr>
                                `
                            }).join("")}
                        </table><br>
                    `;

                    let q4 = {
                        "Strongly disagree": 0,
                        "Disagree": 0,
                        "Neutral": 0,
                        "Agree": 0,
                        "Strongly agree": 0,
                    };
                    results.forEach(r => {
                        const q = r.otherQuestions.q4;
                        if(!q4[q]) q4[q] = 0;
                        q4[q]++;
                    });

                    let q4_arr = [];
                    for(k in q4){
                        q4_arr.push({
                            answer: k,
                            count: q4[k]
                        });
                    }

                    console.log(q4_arr);
                    
                    output += `
                        Task time matters<br>
                        <table>
                            ${q4_arr.sort((a,b) => agreementScale.indexOf(a.answer) - agreementScale.indexOf(b.answer)).map(q => {
                                return `
                                <tr>
                                    <td class="answerCell"><b>${q.answer.length > 80?q.answer.substr(0,80)+"...":q.answer}</b></td>
                                    <td class="answerCountCell">
                                        <div class="answerBar" style="width: ${20*q.count}px">${q.count}</div>
                                    </td>
                                </tr>
                                `
                            }).join("")}
                        </table><br>
                    `;

                    output += "<br><br><hr>";

                    $('.content').html(output);
                });
            } 
        });
    });
}();
