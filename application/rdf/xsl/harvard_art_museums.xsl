<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:base="http://example.com/"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:dcterms="http://purl.org/dc/terms/"
    xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
    xmlns:sioc="http://rdfs.org/sioc/ns#">

    <!-- Harvard Art Museums import XSL version 1.0 by Tylor Dodge -->

    <xsl:variable name="archiveName">
        <xsl:text>Harvard Art Museums</xsl:text>
    </xsl:variable>

    <!-- Templates -->

    <xsl:template match="/">
        <rdf:RDF>
            <xsl:apply-templates select="//node/node[images]" />
        </rdf:RDF>
    </xsl:template>

    <xsl:template match="*"></xsl:template>

    <xsl:template match="//node/node[images]">
        <rdf:Description rdf:about="{url}">
            <art:thumbnail rdf:resource="{concat(images/node[1]/iiifbaseuri, '/full/!225,225/0/default.jpg')}" />
            <art:filename><xsl:value-of select="concat(seeAlso/node[1]/id, '?iiif-manifest=1')" /></art:filename>
            <dcterms:title><xsl:value-of select="title" /></dcterms:title>
            <dcterms:description><xsl:value-of select="description" /></dcterms:description>
            <dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
            <dcterms:accrualMethod><xsl:value-of select="accessionmethod" /></dcterms:accrualMethod>
            <dcterms:available><xsl:value-of select="accessionyear" /></dcterms:available>
            <dcterms:medium><xsl:value-of select="medium" /></dcterms:medium>
            <dcterms:format><xsl:value-of select="dimensions" /></dcterms:format>
            <dcterms:provenance><xsl:value-of select="provenance" /></dcterms:provenance>
            <dcterms:rights><xsl:value-of select="copyright" /></dcterms:rights>
            <dcterms:rightsHolder><xsl:value-of select="creditline" /></dcterms:rightsHolder>
            <dcterms:type><xsl:value-of select="classification" /></dcterms:type>
            <xsl:if test="count(places/node/displayname) > 0">
                <dcterms:spatial><xsl:value-of select="concat(places/node/displayname, ' (', places/node/type, ')')"/></dcterms:spatial>
            </xsl:if>
            <xsl:if test="count(culture) > 0">
                <dcterms:coverage><xsl:value-of select="concat('Culture:', culture)" /></dcterms:coverage>
            </xsl:if>
        </rdf:Description>
    </xsl:template>

</xsl:stylesheet>