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
      			xmlns:rss="http://purl.org/rss/1.0/"
      			xmlns:vra="http://purl.org/vra/">  
    
    <!-- Critical Commons (2nd version) XSL version 3.0 by Craig Dietrich -->                            
                            
    <xsl:variable name="archiveName">
		<xsl:text>Critical Commons</xsl:text>
	</xsl:variable>                          
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="/root/node" />	
		</rdf:RDF>		
	</xsl:template>  
	
	<xsl:template match="/root/node">	
			<rdf:Description rdf:about="{media_url}">
				<art:thumbnail rdf:resource="https://criticalcommons.org{normalize-space(thumbnail_url)}" />
				<art:filename rdf:resource="{normalize-space(media_url)}" />
				<dcterms:title><xsl:value-of select="normalize-space(title)"/></dcterms:title>
				<dcterms:description><xsl:value-of select="normalize-space(description)"/></dcterms:description>
				<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
				<dcterms:contributor><xsl:value-of select="normalize-space(user)"/></dcterms:contributor>
				<dcterms:dateSubmitted><xsl:value-of select="normalize-space(add_date)"/></dcterms:dateSubmitted>
				<vra:duration><xsl:value-of select="normalize-space(duration)"/></vra:duration>
				<art:sourceLocation rdf:resource="{url}" />
				<dcterms:type><xsl:value-of select="normalize-space(media_type)"/></dcterms:type>
			</rdf:Description>
	</xsl:template>	    
   
</xsl:stylesheet>                