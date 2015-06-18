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

import {subscriptionOffers, subscriptionDetails} from '../subscriptions/subscription-data';

class SubscriptionCtrl {
  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor (codenvyAPI, $location, $window, lodash) {
      this.codenvyAPI = codenvyAPI;
      this.$location = $location;
      this.$window = $window;
      this.lodash = lodash;
      this.proposals = [];
      this.subscriptions = [];

      if (this.codenvyAPI.getAccount().getAccounts().length > 0) {
        this.fetchSubscriptions();
      } else {
        this.codenvyAPI.getAccount().fetchAccounts().then(() => {
          this.fetchSubscriptions();
        });
      }
  }

  fetchSubscriptions() {
    let currentAccount = this.codenvyAPI.getAccount().getCurrentAccount();
    this.codenvyAPI.getAccount().fetchSubscriptions(currentAccount.id).then(() => {
      this.processSubscriptions(this.codenvyAPI.getAccount().getSubscriptions(currentAccount.id));
    }, (error) => {
      if (error.status === 304) {
        this.processSubscriptions(this.codenvyAPI.getAccount().getSubscriptions(currentAccount.id));
      }
    });
  }

  /**
   * Checks the list of subscriptions, if subscription exists - prepares it's display info,
   * if not adds new proposals. There two types of subscriptions : on-premises and saas(pay-as-you-go).
  */
  processSubscriptions(subscriptions) {
    this.payAsYouGoSubscription = null;
    let services = this.lodash.pluck(subscriptions, 'serviceId');
    let hasOnPremises = services.indexOf(this.codenvyAPI.getAccount().getOnPremServiceId()) >= 0;
    let saasServiceId = this.codenvyAPI.getAccount().getSaasServiceId();
    let onPremServiceId = this.codenvyAPI.getAccount().getOnPremServiceId();

    let saasSubscription = this.lodash.find(subscriptions, function (subscription) {
      return subscription.serviceId === saasServiceId;
    });

    let onPremSubscription = this.lodash.find(subscriptions, function (subscription) {
      return subscription.serviceId === onPremServiceId;
    });

    if (saasSubscription) {
      if (saasSubscription.planId === this.codenvyAPI.getAccount().getPayAsYouGoPlanId()) {
        this.fillPayAsYouGoDetails(saasSubscription);
        this.payAsYouGoSubscription = saasSubscription;
      } else if (saasSubscription.planId === this.codenvyAPI.getAccount().getPrepaidPlanId()) {
        this.fillPrePaidDetails(saasSubscription);
        this.subscriptions.push(saasSubscription);
      }
    } else {
      this.proposals.push(this.getPayAsYouGoProposal());
    }

    if (hasOnPremises) {
      this.fillOnPremDetails(onPremSubscription);
      this.subscriptions.push(onPremSubscription);
    } else {
      this.proposals.push(this.getOnPremProposal());
    }
  }

  fillPayAsYouGoDetails(saasSubscription) {
    var ctrl = this;

    let details = this.lodash.find(subscriptionDetails, function (detail) {
      return detail.type === 'pay-as-you-go';
    });

    saasSubscription.title = details.title;
    saasSubscription.icon = details.icon;
    saasSubscription.buttonTitle = details.buttonTitle;
    saasSubscription.cancel = function() {
      ctrl.cancelPayAsYouGo(ctrl.$location);
    };

    saasSubscription.attributes = [];
    saasSubscription.attributes.push({title : "Free GBH", value : 0 });
    saasSubscription.attributes.push({title : "Billing Rate", value : 0 });
    saasSubscription.attributes.push({title : "Activation Date", value : saasSubscription.startDate });
    saasSubscription.attributes.push({title : "Next Renewal", value : saasSubscription.endDate });
  }

  fillPrePaidDetails(prepaidSubscription) {
    var ctrl = this;
    let details = this.lodash.find(subscriptionDetails, function (detail) {
      return detail.type === 'prepaid';
    });

    let prepaid = prepaidSubscription.properties.PrepaidGbH;
    prepaidSubscription.title = details.title;
    prepaidSubscription.icon = details.icon;
    prepaidSubscription.buttonTitle = details.buttonTitle;
    prepaidSubscription.cancel = function() {
      ctrl.cancelPrePaid(ctrl.$window);
    };

    prepaidSubscription.attributes = [];
    prepaidSubscription.attributes.push({title : "Prepaid GBH", value : 0 });
    prepaidSubscription.attributes.push({title : "Free GBH", value : 0 });
    prepaidSubscription.attributes.push({title : "Overage GBH rate", value : 0 });
    prepaidSubscription.attributes.push({title : "Activation Date", value : prepaidSubscription.startDate });
    prepaidSubscription.attributes.push({title : "Next Renewal", value : prepaidSubscription.endDate });
  }

  fillOnPremDetails(onPremSubscription) {
    var ctrl = this;
    let details = this.lodash.find(subscriptionDetails, function (detail) {
      return detail.type === 'on-prem';
    });

    onPremSubscription.title = details.title;
    onPremSubscription.icon = details.icon;
    onPremSubscription.buttonTitle = details.buttonTitle;
    onPremSubscription.cancel = function() {
      ctrl.cancelOnPrem(ctrl.$window);
    };
  }

  getPayAsYouGoProposal() {
    var ctrl = this;
    let payAsYouGoOffer = this.lodash.find(subscriptionOffers, function (offer) {
      return offer.type === 'pay-as-you-go';
    });

    payAsYouGoOffer.buy = function() {
        ctrl.onPayAsYouGoChoosen(ctrl.$location);
      };
    return payAsYouGoOffer;
   }

  onPayAsYouGoChoosen($location) {
    $location.path('account');
  }

  onPremChoosen($window) {
    $window.open('https://codenvy.com/products/onprem', '_blank');
  }

  cancelPayAsYouGo(location) {
    location.path('account');
  }

  cancelPrePaid($window) {
    $window.location.href =  'mailto:sales@codenvy.com?subject=' + encodeURIComponent('Cancellation of Pre-Paid Subscription');
  }

  cancelOnPrem($window) {
    $window.location.href =  'mailto:sales@codenvy.com?subject=' + encodeURIComponent('Cancellation of On-Prem Subscription');
  }


  getOnPremProposal() {
    var ctrl = this;
    let onPremOffer = this.lodash.find(subscriptionOffers, function (offer) {
      return offer.type === 'on-prem';
    });
    onPremOffer.buy = function() {
      ctrl.onPremChoosen(ctrl.$window);
    };
    return onPremOffer;
  }
}

export default SubscriptionCtrl;
