/*
 * Copyright (c) 2015 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 */
'use strict';

class BillingCtrl {

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor (codenvyAPI, lodash, codenvyNotificationService) {
    this.codenvyAPI = codenvyAPI;
    this.codenvyNotificationService = codenvyNotificationService;
    this.lodash = lodash;
    this.providedResources = {};
    this.isFreeAccount = true;

    this.invoices = [];

    if (this.codenvyAPI.getAccount().getAccounts().length > 0) {
      this.fetchInvoices();
      this.fetchSubscriptions();
    } else {
      this.codenvyAPI.getAccount().fetchAccounts().then(() => {
        this.fetchInvoices();
        this.fetchSubscriptions();
      });
    }

   this.detectCurrentMonthPeriod();

  }

  fetchSubscriptions() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.codenvyAPI.getAccount().fetchSubscriptions(currentAccount.id).then(() => {
      this.isFreeAccount = this.codenvyAPI.getAccount().getSubscriptions(currentAccount.id).length === 0;
      this.detectUsage();
    }, (error) => {
      if (error.status === 304) {
        this.isFreeAccount = this.codenvyAPI.getAccount().getSubscriptions(currentAccount.id).length === 0;
        this.detectUsage();
      }
    });
  }

  fetchInvoices() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.codenvyAPI.getPayment().fetchInvoices(currentAccount.id).then(() => {
      this.processInvoices(this.codenvyAPI.getPayment().getInvoices(currentAccount.id));
    }, (error) => {
      if (error.status === 304) {
        this.processInvoices(this.codenvyAPI.getPayment().getInvoices(currentAccount.id));
      } else {
        this.codenvyNotificationService.showError(error.data.message !== null ? error.data.message : 'Failed to load invoices.');
      }
    });
  }

  detectCurrentMonthPeriod() {
    let currentDate = new Date();
    //Last day of the month is detected by increasing a month and taking last day of the previous month.
    // Note - Tested with Dec.(last month) - it works ok (year will be increased, but year is need only for Feb.)
    let lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    this.startPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth(), lastDayOfMonth);
  }

  detectUsage() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.usedGBH = 0;

    this.codenvyAPI.getSaas().fetchUsedResources(currentAccount.id).then(() => {
      let resources = this.codenvyAPI.getSaas().getUsedResources(currentAccount.id);
      this.usedGBH = this.countUsedGBH(resources);
      this.getProvided(currentAccount);
    });
  }

  getProvided(account) {
    this.codenvyAPI.getSaas().fetchProvidedResources(account.id).then(() => {
      this.providedResources = this.codenvyAPI.getSaas().getProvidedResources(account.id);
      this.setUpChart(this.usedGBH, this.providedResources.freeAmount);
    });
  }

  countUsedGBH(resources) {
    let used = this.lodash.pluck(resources, 'memory');
    let usedMb = used.reduce(function(sum, use) {
      sum += use;
      return sum;
    });
    return (usedMb).toFixed(2);
  }

  setUpChart(used, provided) {
    let available = provided - used;
    let usedPercents = (used * 100 / provided).toFixed(0);
    let availablePercents = 100 - usedPercents;

    this.config = {
      tooltips: true,
      labels: false,
      mouseover: function() {},
      mouseout: function() {},
      click: function() {},
      legend: {
        display: false,
        position: 'right'
      },
      innerRadius: '25',
      colors: ['#4e5a96', '#d4d4d4']
    };

    this.data = {
      data: [{
        x: 'Consumed',
        y: [used],
        tooltip: 'Consumed (' + usedPercents + '%)'
      }, {
        x: 'Available',
        y: [available],
        tooltip: 'Available (' + availablePercents + '%)'
      }]
    };


  }

  processInvoices(invoices) {
    this.invoices = invoices;
    this.invoices.forEach((invoice) => {
      var link = this.lodash.find(invoice.links, function(link) {
        return link.rel === 'html view';
      });
      if (link) {
        invoice.htmlLink = link.href;
      }
    });
  }
}

export default BillingCtrl;
