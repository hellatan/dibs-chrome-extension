(function () {
    var $ = Sizzle;
    var githubUriPR = 'https://github.com/pulls';
    var jiraIssues = 'https://1stdibs.atlassian.net/issues/?jql=fixVersion%20%3D%20{version}%20ORDER%20BY%20status%20ASC';
    var jiraTicket = 'https://1stdibs.atlassian.net/browse/{ticket}';
    var filters = {
        'is': 'is',
        'user': 'user',
        'milestone': 'milestone'
    };
    var decimalRegexp = /^\d{1,2}(\.\d{1,2})+$/;
    var jiraTicketRegexp = /^\w-\d{1, 6}$/;
    var helpers;
    var elHelpers;
    var validationHelpers;
    var filterSets;

    helpers = {
        filterValue: function (e, type) {
            type = (type || '').toLowerCase();
            if (type === 'milestone') {
                return this.filterMilestone(e);
            } else if (type === 'fixversion') {
                return this.filterFixVersion(e);
            } else if (type === 'jiraticket') {
                return this.filterJiraTicket(e);
            }
        },
        filterFixVersion: function (e) {
            e.preventDefault();
            filterSets.fixVersionFilter();
            return false;
        },
        filterMilestone: function (e) {
            e.preventDefault();
            filterSets.milestonePRs();
            return false;
        },
        filterJiraTicket: function (e) {
            e.preventDefault();
            filterSets.jiraTicketFilter();
            return false;
        },
        createFilterUrl: function (uri, values) {
            var ret = uri;
            if (Array.isArray(values)) {
                values = encodeURIComponent(values.join(' '));
                ret += '?q=' + values;
            }
            return ret;
        },
        goToUrl: function (url) {
            window.open(url);
        }
    };

    elHelpers = {
        getEl: function (el) {
            return $(el);
        },
        getFixVersion: function () {
            return this.getEl('#formFixVersionInput')
        },
        getMilestone: function () {
            return this.getEl('#formMilestoneInput')
        },
        getStatus: function () {
            return this.getEl('#formStatus > input[type=radio]');
        },
        getJiraTicket: function () {
            return this.getEl('#formJiraTicketInput');
        },
        getFixVersionValue: function () {
            var $el = this.getFixVersion();
            return $el.length ? $el[0].value : '';
        },
        getJiraTicketValue: function () {
            var $el = this.getJiraTicket();
            return $el.length ? $el[0].value : '';
        },
        getMilestoneValue: function () {
            var $el = this.getMilestone();
            return $el.length ? $el[0].value : '';
        },
        getStatusValue: function () {
            var $radios = this.getStatus();
            var value = $radios.filter(function (item) {
                return item.checked === true;
            });
            return value.length ? value[0].value : ''
        },
        showError: function (err) {
            var $el;
            switch (err.toLowerCase()) {
                case 'milestone':
                    $el = this.getMilestone();
                    break;
                case 'status':
                    $el = this.getStatus();
                    break;
                case 'fixversion':
                    $el = this.getFixVersion();
                    break;
                case 'jiraticket':
                    $el = this.getJiraTicket();
                    break;
            }
            if ($el.length) {
                $el[0].parentNode.classList.add('err');
            }
        },
        removeError: function (err) {
            switch (err.toLowerCase()) {
                case 'milestone':
                    $el = this.getMilestone();
                    break;
                case 'status':
                    $el = this.getStatus();
                    break;
                case 'fixversion':
                    $el = this.getFixVersion();
                    break;
                case 'jiraticket':
                    $el = this.getJiraTicket();
                    break;
            }
            if ($el.length) {
                $el[0].parentNode.classList.remove('err');
            }
        }
    };

    validationHelpers = {
        milestone: function () {
            var milestone = elHelpers.getMilestoneValue();
            var validMilestone = this.handleMilestoneState(milestone);
            if (!validMilestone) {
                return false;
            }
            return {
                value: milestone
            };
        },
        status: function () {
            var status = elHelpers.getStatusValue();
            var validStatus = this.handleStatusState(status);
            if (!validStatus) {
                return false;
            }
            return {
                value: status
            }
        },
        fixVersion: function () {
            var fixVersion = elHelpers.getFixVersionValue();
            var validFixVersion = this.handleFixVersionState(fixVersion);
            if (!validFixVersion) {
                return false;
            }
            return {
                value: fixVersion
            }
        },
        jiraTicket: function () {
            var jiraTicket = elHelpers.getJiraTicketValue();
            var validJiraTicket = this.handleJiraTicketState(jiraTicket);
            if (!validJiraTicket) {
                return false;
            }
            return {
                value: jiraTicket
            }
        },
        handleMilestoneState: function (milestone) {
            if (!milestone || !decimalRegexp.test(milestone)) {
                elHelpers.showError('milestone');
                return false;
            }
            elHelpers.removeError('milestone');
            return true;
        },
        handleStatusState: function (status) {
            if (!status) {
                elHelpers.showError('status');
                return false;
            }
            elHelpers.removeError('status');
            return true;
        },
        handleFixVersionState: function (fixVersion) {
            if (!fixVersion || !decimalRegexp.test(fixVersion)) {
                elHelpers.showError('fixVersion');
                return false;
            }
            elHelpers.removeError('fixVersion');
            return true;
        },
        handleJiraTicketState: function (ticket) {
            if (!ticket || jiraTicketRegexp.test(ticket)) {
                elHelpers.showError('jiraTicket');
                return false;
            }
            elHelpers.removeError('jiraTicket');
            return true;
        }
    };

    filterSets = {
        milestonePRs: function () {
            var milestone = validationHelpers.milestone();
            var status = validationHelpers.status();
            var filterValues = {};
            var qsVals = [];
            var url;
            if (milestone && status) {
                filterValues[filters.user] = '1stdibs';
                filterValues[filters.is] = status.value;
                filterValues[filters.milestone] = milestone.value;
                Object.keys(filterValues).forEach(function (key) {
                    var filter = key + ':' + filterValues[key];
                    qsVals.push(filter);
                });
                url = helpers.createFilterUrl(githubUriPR, qsVals);
                helpers.goToUrl(url);
            }
        },
        fixVersionFilter: function () {
            var fixVersionInfo = validationHelpers.fixVersion();
            var url;
            if (fixVersionInfo) {
                url = jiraIssues.replace('{version}', fixVersionInfo.value);
                helpers.goToUrl(url);
            }
        },
        jiraTicketFilter: function () {
            var jiraTicketInfo = validationHelpers.jiraTicket();
            var url;
            if (jiraTicketInfo) {
                url = jiraTicket.replace('{ticket}', jiraTicketInfo.value);
                helpers.goToUrl(url);
            }
        }
    };

    function init() {
        document
            .getElementById('formMilestoneSearch')
            .addEventListener('click', function (e) {
                helpers.filterValue(e, 'milestone');
            });
        document
            .getElementById('formFixVersionSearch')
            .addEventListener('click', function (e) {
                helpers.filterValue(e, 'fixVersion');
            });
        document
            .getElementById('formJiraTicketSearch')
            .addEventListener('click', function (e) {
                helpers.filterValue(e, 'jiraTicket');
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        init();
    });

    window.helpers = helpers;

})();