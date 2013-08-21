<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#"
				xmlns:atom="http://www.w3.org/2005/Atom" 
				xmlns:media="http://search.yahoo.com/mrss/"
      			xmlns:syn="http://purl.org/rss/1.0/modules/syndication/"
      			xmlns:rss="http://purl.org/rss/1.0/">  
    
    <!-- Critical Commons (2nd version) XSL version 1.0 by Craig Dietrich -->                            
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="rdf:RDF/rss:channel" />	
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="rdf:RDF/rss:channel">	
		<xsl:apply-templates select="/rdf:RDF/rss:item">
			<xsl:with-param name="ArchiveName" select="rss:title" />
			<xsl:with-param name="ArchiveDesc" select="rss:description" />
			<xsl:with-param name="ArchiveImage" select="rss:image/@rdf:resource" />
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template match="/rdf:RDF/rss:item">	
		<xsl:param name="ArchiveName" />
		<xsl:if test = "not(normalize-space(rss:link) = 'None/None')">
			<rdf:Description rdf:about="{@rdf:about}">
				<dcterms:source><xsl:value-of select="$ArchiveName"/></dcterms:source>
				<art:thumbnail rdf:resource="{normalize-space(art:thumbnail/@url)}" />
				<art:filename rdf:resource="{normalize-space(rss:link)}" />
				<art:sourceLocation rdf:resource="{@rdf:about}" />
				<dcterms:title><xsl:value-of select="normalize-space(rss:title)"/></dcterms:title>
				<dcterms:description><xsl:value-of select="normalize-space(rss:description)"/></dcterms:description>
				<dcterms:date><xsl:value-of select="normalize-space(dcterms:created)"/></dcterms:date>
				<dcterms:dateSubmitted><xsl:value-of select="normalize-space(dcterms:date)"/></dcterms:dateSubmitted>
				<dcterms:type><xsl:value-of select="normalize-space(dcterms:type)"/></dcterms:type>
				<dcterms:contributor><xsl:value-of select="normalize-space(dcterms:contributor)"/></dcterms:contributor>
				<dcterms:creator><xsl:value-of select="normalize-space(dcterms:creator)"/></dcterms:creator>
				<dcterms:relation><xsl:value-of select="normalize-space(dcterms:source)"/></dcterms:relation>
				<dcterms:publisher><xsl:value-of select="normalize-space(dcterms:publisher)"/></dcterms:publisher>
				<dcterms:rights><xsl:value-of select="normalize-space(dcterms:rights)"/></dcterms:rights>
				<xsl:apply-templates select="dc:subject" />
			</rdf:Description>
		</xsl:if>
	</xsl:template>	
	
	<xsl:template match="dcterms:subject">	
		<dcterms:subject><xsl:value-of select="."/></dcterms:subject>
	</xsl:template>	 	    
   
</xsl:stylesheet>                