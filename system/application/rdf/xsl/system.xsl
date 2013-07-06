<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://scalar.usc.edu/2012/01/scalar-ns#"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#"
				xmlns:atom="http://www.w3.org/2005/Atom" 
				xmlns:media="http://search.yahoo.com/mrss/"
      			xmlns:syn="http://purl.org/rss/1.0/modules/syndication/"
      			xmlns:rss="http://purl.org/rss/1.0/"
      			xmlns:ov="http://open.vocab.org/terms/">                            
                          
    <!-- Convert RDF from the Scalar API (which has parent and version nodes) to a flattened version (single nodes with all fields) -->                      
    <!-- (2nd version) XSL version 1.0 by Craig Dietrich -->   
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//dcterms:isVersionOf" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="//dcterms:isVersionOf">
		<xsl:variable name="URI" select="@rdf:resource" />
		<xsl:variable name="thumbnail" select="//rdf:Description[@rdf:about=$URI]/art:thumbnail/@rdf:resource" />
		<rdf:Description rdf:about="{$URI}">
			<xsl:apply-templates select="preceding-sibling::*" mode="copy" />
            <xsl:apply-templates select="following-sibling::*" mode="copy" />
            <art:thumbnail rdf:resource="{$thumbnail}" />
            <scalar:source rdf:resource="{$URI}" />
     	</rdf:Description>
	</xsl:template>
<!-- url to filename -->
  	<xsl:template match="*" mode="copy">
  		<xsl:choose>
          <xsl:when test="name(.)='art:url'">
          	<art:filename rdf:resource="{@rdf:resource}" />
          </xsl:when>  		
          <xsl:when test="name(.)='rdf:type'">
          </xsl:when>
          <xsl:when test="name(.)='scalar:defaultView'">
          </xsl:when>   
          <xsl:when test="name(.)='scalar:urn'">
          </xsl:when>                   
          <xsl:when test="name(.)='scalar:source'">
          </xsl:when>          
          <xsl:otherwise>
            <xsl:copy-of select="." />
          </xsl:otherwise>
        </xsl:choose>  	

    </xsl:template>

</xsl:stylesheet>                