'use strict'
function a(){
	ReplayHelper.init(replay=>{
		if(replay.wrapped){
			document.documentElement.classList.add('wrapped');
		}
		/**
		 * - The code below is there for inspiration only, none of it is required but the `matchLog.log` array contains the log dumps form the arena and they are the source for the replay viewer.
		 * - In order to help replays to look similar, the `ReplayHelper` adds a color field to the `team` and `participant` objects, but if you want to you can use what ever color you want if no other color is provided in the log from the arena.
		 */
		let html = '';
		html += '<table><tr><th colspan="3">Logs</th></tr><tr><th>Match</th><th>Name</th><th>Count</th></tr>';
		let logsTotal = {};
		replay.arenaResult.matchLogs.forEach((matchLog, matchIndex) => {
			let logs = {};
			matchLog.log.forEach(log => {
				if(!logs[log.type]){
					logs[log.type] = 0;
				}
				if(!logsTotal[log.type]){
					logsTotal[log.type] = 0;
				}
				logs[log.type]++;
				logsTotal[log.type]++;
			});
			Object.keys(logs).sort().forEach(key => {
				html += '<tr><td>'+(matchIndex+1)+'</td><td>'+key+'</td><td>'+logs[key]+'</td></tr>';
			});
		});
		Object.keys(logsTotal).sort().forEach(key => {
			html += '<tr><td>Total</td><td>'+key+'</td><td>'+logsTotal[key]+'</td></tr>';
		});
		html += '</table>';
		let matchLogErrors = replay.arenaResult.matchLogs.filter(l => l.error);
		if(matchLogErrors.length){
			html = '<b class="error">Aborted</b><br>';
			matchLogErrors.forEach(matchLogError => html += '<div style="color: white">Match '+(replay.arenaResult.matchLogs.findIndex(l => l===matchLogError)+1)+': '+(matchLogError.participantName?matchLogError.participantName+': ':'')+matchLogError.error+'</div>');
		}
		html += '<div style="text-align: center;">';
		html += '<table style="display: inline"><tr><th colspan="2">Participants</th></tr><tr><th>Team</th><th>Name</th></tr>';
		let singleTeamsOnly = true;
		replay.arenaResult.teams.forEach((team, teamIndex) => {
			singleTeamsOnly &= team.members.length === 1;
			team.members.forEach(participant => {
				html += '<tr><td style="color: '+team.color.RGB+';">'+(teamIndex+1)+'</td><td style="color: '+participant.color.RGB+';">'+participant.name+'</td></tr>';
			});
		});
		html += '</table>';
		html += '<div style="font-style: italic; margin-top: 1em;">'+(replay.arenaResult.result.partialResult?'Partial result':'Results')+'</div>';
		let individualScores = {general: '', summarized: ['', '']};
		if(!singleTeamsOnly){
			html += '<table style="display: inline;"><tr><th colspan="3">Team scores</th></tr><tr><th>Match</th><th>Team</th><th>Score</th></tr>';
			let summarized = ['', ''];
			replay.arenaResult.matchLogs.forEach((matchLog, matchIndex) => {
				matchLog.scores.forEach(scoreLog => {
					let team = replay.arenaResult.teams[scoreLog.team];
					html += '<tr><td>'+(matchIndex+1)+'</td><td style="color: '+team.color.RGB+';">'+(scoreLog.team+1)+'</td><td>'+scoreLog.score+'</td></tr>';
					scoreLog.members.forEach(member => {
						let participant = team.members.find(m => m.name === member.name);
						individualScores.general += '<tr><td>'+(matchIndex+1)+'</td><td style="color: '+participant.color.RGB+';">'+member.name+'</td><td>'+member.bonus+'</td><td>'+(scoreLog.score+member.bonus)+'</td></tr>';
					});
				});
			});
			if(1 < replay.arenaResult.matchLogs.length){
				replay.arenaResult.result.team.forEach((teamScore, teamIndex) => {
					let team = replay.arenaResult.teams[teamIndex];
					summarized[0] += '<tr><td>Total</td><td style="color: '+team.color.RGB+';">'+(teamIndex+1)+'</td><td>'+teamScore.total.score+'</td></tr>';
					summarized[1] += '<tr><td>Average</td><td style="color: '+team.color.RGB+';">'+(teamIndex+1)+'</td><td>'+teamScore.average.score+'</td></tr>';
					teamScore.total.bonusPoints.forEach(member => {
						let participant = team.members.find(m => m.name === member.participant);
						individualScores.summarized[0] += '<tr><td>Total</td><td style="color: '+participant.color.RGB+';">'+member.participant+'</td><td>'+member.bonus+'</td><td>'+(teamScore.total.score+member.bonus)+'</td></tr>';
					});
					teamScore.average.bonusPoints.forEach(member => {
						let participant = team.members.find(m => m.name === member.participant);
						individualScores.summarized[1] += '<tr><td>Average</td><td style="color: '+participant.color.RGB+';">'+member.participant+'</td><td>'+member.bonus+'</td><td>'+(teamScore.average.score+member.bonus)+'</td></tr>';
					});
				});
			}
			html += summarized.join('')+'</table>';
		}
		html += '<table style="display: inline; margin-left: 2em;"><tr><th colspan="4">Individual scores</th></tr><tr><th>Match</th><th>Participant</th><th>Score</th><th>Including team score</tr>';
		html += individualScores.general+individualScores.summarized.join('')+'</table>';
		html += '</div>';
		document.body.innerHTML += html;
	});
}
