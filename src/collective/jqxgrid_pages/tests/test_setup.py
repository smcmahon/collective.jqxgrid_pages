# -*- coding: utf-8 -*-
"""Setup/installation tests for this package."""
from collective.jqxgrid_pages.testing import COLLECTIVE_JQXGRID_PAGES_INTEGRATION_TESTING  # noqa
from plone import api

import unittest2 as unittest


class TestInstall(unittest.TestCase):
    """Test installation of collective.jqxgrid_pages into Plone."""

    layer = COLLECTIVE_JQXGRID_PAGES_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')

    def test_product_installed(self):
        """Test if collective.jqxgrid_pages is installed with portal_quickinstaller."""
        self.assertTrue(self.installer.isProductInstalled('collective.jqxgrid_pages'))

    def test_uninstall(self):
        """Test if collective.jqxgrid_pages is cleanly uninstalled."""
        self.installer.uninstallProducts(['collective.jqxgrid_pages'])
        self.assertFalse(self.installer.isProductInstalled('collective.jqxgrid_pages'))

    # browserlayer.xml
    def test_browserlayer(self):
        """Test that ICollectiveJqxgridPagesLayer is registered."""
        from collective.jqxgrid_pages.interfaces import ICollectiveJqxgridPagesLayer
        from plone.browserlayer import utils
        self.assertIn(ICollectiveJqxgridPagesLayer, utils.registered_layers())
