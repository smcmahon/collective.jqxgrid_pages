# -*- coding: utf-8 -*-
"""Base module for unittesting."""

from plone.app.robotframework.testing import REMOTE_LIBRARY_BUNDLE_FIXTURE
from plone.app.testing import applyProfile
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PLONE_FIXTURE
from plone.app.testing import PloneSandboxLayer
from plone.testing import z2
from zope.configuration import xmlconfig

import collective.jqxgrid_pages


class CollectiveJqxgridPagesLayer(PloneSandboxLayer):

    defaultBases = (PLONE_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        xmlconfig.file(
            'configure.zcml',
            collective.jqxgrid_pages,
            context=configurationContext
        )

    def setUpPloneSite(self, portal):
        applyProfile(portal, 'collective.jqxgrid_pages:default')


COLLECTIVE_JQXGRID_PAGES_FIXTURE = CollectiveJqxgridPagesLayer()


COLLECTIVE_JQXGRID_PAGES_INTEGRATION_TESTING = IntegrationTesting(
    bases=(COLLECTIVE_JQXGRID_PAGES_FIXTURE,),
    name='CollectiveJqxgridPagesLayer:IntegrationTesting'
)


COLLECTIVE_JQXGRID_PAGES_FUNCTIONAL_TESTING = FunctionalTesting(
    bases=(COLLECTIVE_JQXGRID_PAGES_FIXTURE,),
    name='CollectiveJqxgridPagesLayer:FunctionalTesting'
)


COLLECTIVE_JQXGRID_PAGES_ACCEPTANCE_TESTING = FunctionalTesting(
    bases=(
        COLLECTIVE_JQXGRID_PAGES_FIXTURE,
        REMOTE_LIBRARY_BUNDLE_FIXTURE,
        z2.ZSERVER_FIXTURE
    ),
    name='CollectiveJqxgridPagesLayer:AcceptanceTesting'
)
