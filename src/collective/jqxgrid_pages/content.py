# -*- coding: utf-8 -*-

from interfaces import IGridPage
from plone.dexterity.content import Item
from zope.interface import implementer


@implementer(IGridPage)
class GridPage(Item):
        """Convenience Item subclass for ``GridPage`` portal type
        """

