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
                            
    <!-- PLAY! import XSL version 1.0 by Craig Dietrich -->                        
      
   	<xsl:variable name="archiveName">
		<xsl:text> via Digital Public Library of America</xsl:text>
	</xsl:variable>    
  
  	<!-- Templates -->    
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//node/node" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
	
	<xsl:template match="//node/node">			
		
		<!-- Determine filename which could be in a few places -->
		<xsl:variable name="url">
	  		<xsl:choose>	
				<xsl:when test="hasView">
					<xsl:choose>
						<xsl:when test="hasView/node[1]">
							<xsl:choose>
								<xsl:when test="hasView/node[1]/id">
									<xsl:value-of select="hasView/node[1]/id" />
								</xsl:when>
								<xsl:when test="hasView/node[1]/url">
									<xsl:value-of select="hasView/node[1]/url" />
								</xsl:when>								
							</xsl:choose>
						</xsl:when>
						<xsl:otherwise>
							<xsl:choose>
								<xsl:when test="hasView/id">
									<xsl:value-of select="hasView/id" />
								</xsl:when>
								<xsl:when test="hasView/url">
									<xsl:value-of select="hasView/url" />
								</xsl:when>
							</xsl:choose>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="object" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>	  
		
		<!--  Determine if the url is an image, if so make the thumbnail too -->
		<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'" />
		<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />
		<xsl:variable name="thumbnail">
			<xsl:choose>
				<xsl:when test="contains(translate($url,$uppercase,$smallcase),'jpg')"><xsl:value-of select="$url" /></xsl:when>
				<xsl:when test="contains(translate($url,$uppercase,$smallcase),'jpeg')"><xsl:value-of select="$url" /></xsl:when>
				<xsl:when test="contains(translate($url,$uppercase,$smallcase),'gif')"><xsl:value-of select="$url" /></xsl:when>
				<xsl:when test="contains(translate($url,$uppercase,$smallcase),'png')"><xsl:value-of select="$url" /></xsl:when>
				<xsl:when test="contains(translate($url,$uppercase,$smallcase),'image')"><xsl:value-of select="$url" /></xsl:when>
				<xsl:when test="contains(translate($url,$uppercase,$smallcase),'thumb')"><xsl:value-of select="$url" /></xsl:when>
			</xsl:choose>
		</xsl:variable>
		
		<!-- Determine format which could be in a few places -->
		<xsl:variable name="format">
	  		<xsl:choose>	
				<xsl:when test="hasView">
					<xsl:choose>
						<xsl:when test="hasView/node[1]/format">
							<xsl:value-of select="hasView/node[1]/format" />
						</xsl:when>
						<xsl:when test="sourceResource/type">
							<xsl:value-of select="sourceResource/type" />
						</xsl:when>
						<xsl:when test="sourceResource/format">
							<xsl:value-of select="sourceResource/format" />
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="sourceResource/format" />
						</xsl:otherwise>						
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="ingestType" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>			
		
		<!-- Determine identifier which could be in a few places -->
		<xsl:variable name="identifier">
	  		<xsl:choose>	
				<xsl:when test="sourceResource/identifier">
					<xsl:value-of select="sourceResource/identifier" />
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="id" />
				</xsl:otherwise>						
			</xsl:choose>
		</xsl:variable>				
	
		<!-- Determine rights which could be in a few places -->
		<xsl:variable name="rights">
	  		<xsl:choose>	
				<xsl:when test="hasView/node[1]/rights">
					<xsl:value-of select="hasView/node[1]/rights" />
				</xsl:when>
				<xsl:when test="hasView/rights">
					<xsl:value-of select="hasView/rights" />
				</xsl:when>				
				<xsl:otherwise>
					<xsl:value-of select="sourceResource/rights" />
				</xsl:otherwise>						
			</xsl:choose>
		</xsl:variable>		
	
		<!-- Determine rights which could be in a few places -->
		<xsl:variable name="creator">
	  		<xsl:choose>	
				<xsl:when test="sourceResource/creator">
					<xsl:value-of select="sourceResource/creator" />
				</xsl:when>		
				<xsl:otherwise>
					<xsl:value-of select="dataProvider" />
				</xsl:otherwise>						
			</xsl:choose>
		</xsl:variable>		
		
		<xsl:variable name="resourceURI" select="isShownAt" />	
			
		<rdf:Description rdf:about="{$resourceURI}">
			<dcterms:title><xsl:value-of select="sourceResource/title" /></dcterms:title>	
			<dcterms:description><xsl:value-of select="sourceResource/description" /></dcterms:description>
			<dcterms:source><xsl:value-of select="provider/name"/><xsl:value-of select="$archiveName"/></dcterms:source>
			<dcterms:type><xsl:value-of select="$format"/></dcterms:type>
			<dcterms:identifier><xsl:value-of select="$identifier"/></dcterms:identifier>		
			<art:filename rdf:resource="{$url}"></art:filename>		
			<art:thumbnail rdf:resource="{$thumbnail}"></art:thumbnail>	
			<art:sourceLocation rdf:resource="{$resourceURI}" />
			<dcterms:date><xsl:value-of select="sourceResource/date/displayDate"/></dcterms:date>
			<dcterms:creator><xsl:value-of select="$creator"/></dcterms:creator>
			<dcterms:publisher><xsl:value-of select="sourceResource/publisher" /></dcterms:publisher>
			<dcterms:rights><xsl:value-of select="$rights"/></dcterms:rights>		
		</rdf:Description>		
	</xsl:template>		
	
	
                
</xsl:stylesheet>                